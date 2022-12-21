const { getConnection } = require('../config/database');

const getDependency = async () => {
    const client = await getConnection();
    const {rows} = await client.query('SELECT * FROM components')
    client.release();
    const comp_dict = {}, proj_dict = {}

    for (let i=0; i<rows.length; i++) {
        const record = rows[i]
        comp_dict[record.component_id] = record;
        proj_dict[record.project_id] = (proj_dict[record.project_id] || [])
        proj_dict[record.project_id].push(record.component_id);
    }

    for (const prop in proj_dict) {
        proj_dict[prop] = proj_dict[prop].map(id => (comp_dict[id].depends_on))
        proj_dict[prop] = proj_dict[prop].filter(id => (id !== null))
        proj_dict[prop] = proj_dict[prop].map(id => (comp_dict[id].project_id))
        proj_dict[prop] = proj_dict[prop].filter(id => (id !== prop))
        proj_dict[prop] = new Set(proj_dict[prop])
    }

    // console.log(proj_dict);

    return proj_dict;
}

const getTable = async (table = 'projects') => {
    const client = await getConnection();
    const {rows} = await client.query('SELECT * FROM '+table)
    client.release();
    return rows
}
const getProjectTable = async () => {
    const client = await getConnection();
    const {rows} = await client.query(`select components.* , projects.*, 'project' as type from components join projects on projects.project_id = components.project_id`);
    client.release();
    return rows
}
const getProposalsTable = async () => {
    const client = await getConnection();
    const {rows} = await client.query(`select components.* , proposals.*, 'project' as type from components join proposals on proposals.project_id = components.project_id`);
    client.release();
    return rows
}

const toDateStr = (date) => {
    let year = date.getFullYear()
    let month = date.getMonth()
    let day = date.getDate()
    return `${year}-${month}-${day}`
}

const addYear = (dateStr, year) => {
    let date = new Date(Date.parse(dateStr))
    date.setFullYear(date.getFullYear() + year)
    return date
}

const baalsaal = async () => {
    let dependency = await getDependency();
    let projects = await getProjectTable()
    let proposals = await getProposalsTable();
    let limits = await getTable('constraints')
    let jobs_arr = [], jobs_dict = {}

    let location_dict = {}, exec_dict = {}, limit_dict = {}, cost_dict = {}
    limits.forEach(({code, max_limit, constraint_type}) => {
        if (constraint_type === 'executing_agency_limit' || constraint_type === 'location_limit')
            limit_dict[code] = max_limit
        else if (constraint_type === 'yearly_funding')
            cost_dict[code] = max_limit
    })

    projects.forEach(project => {
        project = {...project, type: 'project'}
        jobs_arr.push(project)
        jobs_dict[project.project_id] = project
        location_dict[project.location] = project
        exec_dict[project.exec] = project
    })

    proposals.forEach(proposal => {
        proposal = {...proposal, type: 'proposal'}
        jobs_arr.push(proposal)
        jobs_dict[proposal.project_id] = proposal
        location_dict[proposal.location] = proposal
        exec_dict[proposal.exec] = proposal
    })

    // console.log(jobs_arr[0])
    // console.log(jobs_arr[1])
    // i = 0; j = 1;
    // [ jobs_arr[0],jobs_arr[1] ] = [ jobs_arr[1],jobs_arr[0] ]
    // console.log("sdfsdfsdfsd");
    // console.log(jobs_arr[0])
    // console.log(jobs_arr[1])
    // return;
    // sort jobs by cost by bubble sort
    let cnt = 0;
    for (let i=0; i<jobs_arr.length; i++) {
        for (let j=i+1; j<jobs_arr.length; j++) {
            if( dependency[jobs_arr[i].project_id] && dependency[jobs_arr[i].project_id].has(jobs_arr[j].project_id ) ){
                [ jobs_arr[i],jobs_arr[j] ] = [ jobs_arr[j],jobs_arr[i] ]
               // console.log("sdfsdfsdfsd");
            } else if( jobs_arr[j].type === 'project' && jobs_arr[j].type === 'proposal' ){
                // swap i and j
                [ jobs_arr[i],jobs_arr[j] ] = [ jobs_arr[j],jobs_arr[i] ]
            }else if( jobs_arr[j].type === 'project' && jobs_arr[i].type === 'project' ){

                // parse float


                if( jobs_arr[j].completion > jobs_arr[i].completion ){
                    // swap i and j
                    cnt++;
                    [ jobs_arr[i],jobs_arr[j] ] = [ jobs_arr[j],jobs_arr[i] ]
                }else if( jobs_arr[j].completion === jobs_arr[i].completion && (jobs_arr[j].timespan < jobs_arr[i].timespan
                    || (jobs_arr[j].timespan === jobs_arr[i].timespan && jobs_arr[j].cost < jobs_arr[i].cost) ) ){
                    // swap i and j
                    [ jobs_arr[i],jobs_arr[j] ] = [ jobs_arr[j],jobs_arr[i] ]
                }
            } else if( jobs_arr[j].type === 'proposal' && jobs_arr[i].type === 'proposal' ){
               if( jobs_arr[j].timespan < jobs_arr[i].timespan
                    || (jobs_arr[j].timespan === jobs_arr[i].timespan && jobs_arr[j].cost < jobs_arr[i].cost) ){
                    // swap i and j
                   [ jobs_arr[i],jobs_arr[j] ] = [ jobs_arr[j],jobs_arr[i] ]
                }
            }
        }
    }

    //console.log(cnt);
    //return;

    let mxDate = new Date();

    const entry_loc_dict = {}
    const entry_exec_dict = {}

    let today = toDateStr(new Date())

    for (let i = 0; i < jobs_arr.length; i++) {
        if( jobs_arr[i].completion === 100 ){
            ;
        }else if (!limit_dict[jobs_arr[i].location] && !limit_dict[jobs_arr[i].exec]) {
            jobs_arr[i].start_date = today
        } else if (limit_dict[jobs_arr[i].location] && !limit_dict[jobs_arr[i].exec]) {
            if (entry_loc_dict[jobs_arr[i].location]) {
                if( entry_loc_dict[jobs_arr[i].location].length < limit_dict[ jobs_arr[i].location ] ){
                    entry_loc_dict[jobs_arr[i].location].push(jobs_arr[i])
                    jobs_arr[i].start_date = today
                }else{
                    // find the earliest date + completion time in the array
                    let earliest = addYear(entry_loc_dict[jobs_arr[i].location][0].start_date, entry_loc_dict[jobs_arr[i].location][0].timespan)
                    let earliest_index = 0
                    for (let j = 1; j < entry_loc_dict[jobs_arr[i].location].length; j++) {
                        if( addYear(entry_loc_dict[jobs_arr[i].location][j].start_date, entry_loc_dict[jobs_arr[i].location][j].timespan) < earliest ) {
                            earliest = addYear(entry_loc_dict[jobs_arr[i].location][j].start_date, entry_loc_dict[jobs_arr[i].location][j].timespan)
                            earliest_index = j
                        }
                    }
                    let endTime = addYear(entry_exec_dict[jobs_arr[i].exec][earliest_index].start_date, entry_exec_dict[jobs_arr[i].exec][earliest_index].timespan)
                    jobs_arr[i].start_date = toDateStr(endTime);
                    entry_loc_dict[jobs_arr[i].location][earliest_index] = jobs_arr[i];
                }
            } else {
                jobs_arr[i].start_date = today
                entry_loc_dict[jobs_arr[i].location] = [];
                entry_loc_dict[jobs_arr[i].location].push(jobs_arr[i]);
            }
        } else if (! limit_dict[jobs_arr[i].location] && limit_dict[jobs_arr[i].exec]) {
            if (entry_exec_dict[jobs_arr[i].exec]) {
                if( entry_exec_dict[jobs_arr[i].exec].length < limit_dict[ jobs_arr[i].exec ] ){
                    entry_exec_dict[jobs_arr[i].exec].push(jobs_arr[i])
                    jobs_arr[i].start_date = today
                }else{
                    // find the earliest date + completion time in the array
                    let earliest = addYear(entry_exec_dict[jobs_arr[i].exec][0].start_date, entry_exec_dict[jobs_arr[i].exec][0].timespan)
                    let earliest_index = 0
                    for (let j = 1; j < entry_exec_dict[jobs_arr[i].exec].length; j++) {
                        if( addYear(entry_exec_dict[jobs_arr[i].exec][j].start_date, entry_exec_dict[jobs_arr[i].exec][j].timespan) < earliest ) {
                            earliest = addYear(entry_exec_dict[jobs_arr[i].exec][j].start_date, entry_exec_dict[jobs_arr[i].exec][j].timespan)
                            earliest_index = j
                        }
                    }
                    let endTime = addYear(entry_exec_dict[jobs_arr[i].exec][earliest_index].start_date, entry_exec_dict[jobs_arr[i].exec][earliest_index].timespan)
                    jobs_arr[i].start_date = toDateStr(endTime);
                    entry_exec_dict[jobs_arr[i].exec][earliest_index] = jobs_arr[i];
                }
            } else {
                jobs_arr[i].start_date = today
                entry_exec_dict[jobs_arr[i].exec] = [];
                entry_exec_dict[jobs_arr[i].exec].push(jobs_arr[i]);
            }
        }else{
            // find the earliest time for location based arrays
            let earliest_index1 = -1;
            let earliest1;
            if (entry_loc_dict[jobs_arr[i].location]) {
                if( entry_loc_dict[jobs_arr[i].location].length < limit_dict[ jobs_arr[i].location ] ){
                    //entry_loc_dict[jobs_arr[i].location].push(jobs_arr[i])
                    earliest1 = new Date();
                }else{
                    // find the earliest date + completion time in the array
                    earliest1 = addYear(entry_loc_dict[jobs_arr[i].location][0].start_date, entry_loc_dict[jobs_arr[i].location][0].timespan)
                    earliest_index1 = 0
                    for (let j = 1; j < entry_loc_dict[jobs_arr[i].location].length; j++) {
                        if( addYear(entry_loc_dict[jobs_arr[i].location][j].start_date, entry_loc_dict[jobs_arr[i].location][j].timespan) < earliest1 ) {
                            earliest1 = addYear(entry_loc_dict[jobs_arr[i].location][j].start_date, entry_loc_dict[jobs_arr[i].location][j].timespan)
                            earliest_index1 = j
                        }
                    }
                   // let endTime = addYear(entry_exec_dict[jobs_arr[i].exec][earliest_index].start_date, entry_exec_dict[jobs_arr[i].exec][earliest_index].timespan)
                    //jobs_arr[i].start_date = toDateStr(endTime);
                   // entry_loc_dict[jobs_arr[i].location][earliest_index] = jobs_arr[i];
                }
            } else {
                earliest1 = new Date();
                entry_loc_dict[jobs_arr[i].location] = [];
                //entry_loc_dict[jobs_arr[i].location].push(jobs_arr[i]);
            }

            // find the earliest time for exec based arrays
            let earliest_index2 = -1;
            let earliest2;
            if (entry_exec_dict[jobs_arr[i].exec]) {
                if( entry_exec_dict[jobs_arr[i].exec].length < limit_dict[ jobs_arr[i].exec ] ){
                    //entry_exec_dict[jobs_arr[i].exec].push(jobs_arr[i])
                    //jobs_arr[i].start_date = today
                    earliest2 = new Date();
                }else{
                    // find the earliest date + completion time in the array
                    earliest2 = addYear(entry_exec_dict[jobs_arr[i].exec][0].start_date, entry_exec_dict[jobs_arr[i].exec][0].timespan)
                    earliest_index2 = 0
                    for (let j = 1; j < entry_exec_dict[jobs_arr[i].exec].length; j++) {
                        if( addYear(entry_exec_dict[jobs_arr[i].exec][j].start_date, entry_exec_dict[jobs_arr[i].exec][j].timespan) < earliest2 ) {
                            earliest2 = addYear(entry_exec_dict[jobs_arr[i].exec][j].start_date, entry_exec_dict[jobs_arr[i].exec][j].timespan)
                            earliest_index2 = j
                        }
                    }
                   // let endTime = addYear(entry_exec_dict[jobs_arr[i].exec][earliest_index].start_date, entry_exec_dict[jobs_arr[i].exec][earliest_index].timespan)
                  //  jobs_arr[i].start_date = toDateStr(endTime);
                  //  entry_exec_dict[jobs_arr[i].exec][earliest_index] = jobs_arr[i];
                }
            } else {
                earliest2 = new Date();
                entry_exec_dict[jobs_arr[i].exec] = [];
               // entry_exec_dict[jobs_arr[i].exec].push(jobs_arr[i]);
            }

            let earliest = earliest1;
            if( earliest2>earliest1 ) earliest = earliest2;

            jobs_arr[i].start_date = toDateStr(earliest);
            if( earliest_index1 !== -1 ) entry_loc_dict[jobs_arr[i].location][earliest_index1] = jobs_arr[i];
            else entry_loc_dict[jobs_arr[i].location].push(jobs_arr[i]);

            if( earliest_index2 !== -1 ) entry_exec_dict[jobs_arr[i].exec][earliest_index2] = jobs_arr[i];
            else entry_exec_dict[jobs_arr[i].exec].push(jobs_arr[i]);


        }
        console.log(jobs_arr[i].start_date);
        let tempDate = new Date(jobs_arr[i].start_date);
        tempDate = addYear(tempDate, jobs_arr[i].timespan);
        if( tempDate > mxDate )
            mxDate = tempDate;
    }
    console.log(mxDate);
   // console.log(jobs_arr)

}

baalsaal()