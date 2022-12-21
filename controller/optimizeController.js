const ProjectRepository = require("../repository/projects.js");
const {getConnection} = require("../config/database");
const {PriorityQueue} = require("@datastructures-js/priority-queue");
const repo = new ProjectRepository();


const getDependency = async () => {
    const client = await getConnection();
    const {rows} = await client.query('SELECT * FROM components')
    client.release();
    const comp_dict = {}, proj_dict = {}

    for(let i=0;i<rows.length;i++){
        const record = rows[i];
        const {component_id, project_id, depends_on} = record;
        if(!comp_dict[component_id]){
            comp_dict[component_id] = new Set();
        }
        comp_dict[component_id].add(depends_on);
    }

    // for (let i=0; i<rows.length; i++) {
    //     const record = rows[i]
    //     comp_dict[record.component_id] = record;
    //     proj_dict[record.project_id] = (proj_dict[record.project_id] || [])
    //     proj_dict[record.project_id].push(record.component_id);
    // }
    //
    // for (const prop in proj_dict) {
    //     proj_dict[prop] = proj_dict[prop].map(id => (comp_dict[id].depends_on))
    //     proj_dict[prop] = proj_dict[prop].filter(id => (id !== null))
    //     proj_dict[prop] = proj_dict[prop].map(id => (comp_dict[id].project_id))
    //     proj_dict[prop] = proj_dict[prop].filter(id => (id !== prop))
    //     proj_dict[prop] = new Set(proj_dict[prop])
    // }

    // console.log(proj_dict);

    return comp_dict;
}

const getTable = async (table = 'projects') => {
    const client = await getConnection();
    const {rows} = await client.query('SELECT * FROM '+table)
    client.release();
    return rows
}
const getProjectTable = async () => {
    const client = await getConnection();
    const {rows} = await client.query(`select components.* , projects.*,projects.cost as project_cost, 'project' as type from components join projects on projects.project_id = components.project_id`);
    client.release();
    return rows
}
const getProposalsTable = async () => {
    const client = await getConnection();
    const {rows} = await client.query(`select components.* , proposals.*,proposals.cost as project_cost, 'proposal' as type from components join proposals on proposals.project_id = components.project_id`);
    client.release();
    return rows
}

const toDateStr = (date) => {
    let year = date.getFullYear()
    let month = date.getMonth()
    let day = date.getDate()
    return `${year}-${month}-${day}`;
}

const addYear = (dateStr, year) => {
    let date = new Date(Date.parse(dateStr))
    date.setFullYear(date.getFullYear() + year)
    return date;
}

class OptimizeController{

    getDependency = async () => {
        const client = await getConnection();
        const {rows} = await client.query('SELECT * FROM components')
        client.release();
        const comp_dict = {}, proj_dict = {}

        for(let i=0;i<rows.length;i++){
            const record = rows[i];
            const {component_id, project_id, depends_on} = record;
            if(!comp_dict[component_id]){
                comp_dict[component_id] = new Set();
            }
            comp_dict[component_id].add(depends_on);
        }

        // for (let i=0; i<rows.length; i++) {
        //     const record = rows[i]
        //     comp_dict[record.component_id] = record;
        //     proj_dict[record.project_id] = (proj_dict[record.project_id] || [])
        //     proj_dict[record.project_id].push(record.component_id);
        // }
        //
        // for (const prop in proj_dict) {
        //     proj_dict[prop] = proj_dict[prop].map(id => (comp_dict[id].depends_on))
        //     proj_dict[prop] = proj_dict[prop].filter(id => (id !== null))
        //     proj_dict[prop] = proj_dict[prop].map(id => (comp_dict[id].project_id))
        //     proj_dict[prop] = proj_dict[prop].filter(id => (id !== prop))
        //     proj_dict[prop] = new Set(proj_dict[prop])
        // }

        // console.log(proj_dict);

        return comp_dict;
    }

    getTable = async (table = 'projects') => {
        const client = await getConnection();
        const {rows} = await client.query('SELECT * FROM '+table)
        client.release();
        return rows
    }
    getProjectTable = async () => {
        const client = await getConnection();
        const {rows} = await client.query(`select components.* , projects.*,projects.cost as project_cost, 'project' as type from components join projects on projects.project_id = components.project_id`);
        client.release();
        return rows
    }
    getProposalsTable = async () => {
        const client = await getConnection();
        const {rows} = await client.query(`select components.* , proposals.*,proposals.cost as project_cost, 'proposal' as type from components join proposals on proposals.project_id = components.project_id`);
        client.release();
        return rows
    }

    toDateStr = (date) => {
        let year = date.getFullYear()
        let month = date.getMonth()
        let day = date.getDate()
        return `${year}-${month}-${day}`
    }

    addYear = (dateStr, year) => {
        let date = new Date(Date.parse(dateStr))
        date.setFullYear(date.getFullYear() + year)
        return date
    }

    configureTimeFrame = async function (req, res) {
      //  console.log("here");
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
            project = {...project, type: 'project'};
            project.cost = project.budget_ratio * project.project_cost;
            project.average_cost = project.cost / project.timespan;
            //console.log(project.cost, project.budget_ratio, project.project_cost);
            jobs_arr.push(project)
            jobs_dict[project.project_id] = project
            location_dict[project.location] = project
            exec_dict[project.exec] = project
        })


        proposals.forEach(proposal => {
            proposal = {...proposal, type: 'proposal'};
            proposal.cost = proposal.budget_ratio * proposal.project_cost;
            proposal.average_cost = proposal.cost / proposal.timespan;
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
                if( dependency[jobs_arr[i].component_id] && dependency[jobs_arr[i].component_id].has(jobs_arr[j].component_id ) ){
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
        const entry_exec_dict = {};

        let currentCost = {};

        let today = toDateStr(new Date())


        let projectStartTime = {};
        let projectEndTime = {};

        for (let i = 0; i < jobs_arr.length; i++) {

            let job = jobs_arr[i];

            if (jobs_arr[i].completion === 100) {

                if( !projectStartTime[ job.project_id ] ){
                    projectEndTime[ job.project_id ] = today;
                    projectStartTime[ job.project_id ] = job.start_date;
                }
                continue;
            }



            if (!entry_loc_dict[job.location]) {
                entry_loc_dict[job.location] = new PriorityQueue((a, b) => {
                    let a_end = addYear(a.start_date, a.timespan)
                    let b_end = addYear(b.start_date, b.timespan)
                    return a_end < b_end;
                });
            }
            if (!entry_exec_dict[job.exec]) {
                entry_exec_dict[job.exec] = new PriorityQueue((a, b) => {
                    let a_end = addYear(a.start_date, a.timespan)
                    let b_end = addYear(b.start_date, b.timespan)
                    return a_end < b_end;
                });
            }
            if (!limit_dict[job.location]) limit_dict[job.location] = jobs_arr.length + 1;
            if (!limit_dict[job.exec]) limit_dict[job.exec] = jobs_arr.length + 1;
            if (!cost_dict[job.exec]) cost_dict[job.exec] = 10000000;
            if (!currentCost[job.exec]) currentCost[job.exec] = 0;



            // cost correction
            let flag = false;
            let mnTime;
            while (entry_exec_dict[job.exec].size() > 0 && currentCost[job.exec] + job.average_cost > cost_dict[job.exec]) {

                let fr = entry_exec_dict[job.exec].front();
                entry_exec_dict[job.exec].pop();
                currentCost[job.exec] -= fr.average_cost;

                let temp = addYear(fr.start_date, fr.timespan);
                if( !flag ) mnTime = temp;
                if (temp > mnTime) mnTime = temp;
                flag = true;
            }

            // exec component limit calculate
            if (entry_exec_dict[job.exec].size() === limit_dict[job.exec]) {

                let fr = entry_exec_dict[job.exec].front();
                entry_exec_dict[job.exec].pop();
                currentCost[job.exec] -= fr.average_cost;

                let temp = addYear(fr.start_date, fr.timespan);
                if( !flag ) mnTime = temp;
                if (temp > mnTime) mnTime = temp;
                flag = true;

            }

            // location component limit calculate
            if (entry_loc_dict[job.location].size() === limit_dict[job.location]) {

                let fr = entry_loc_dict[job.location].front();
                entry_loc_dict[job.location].pop();

                let temp = addYear(fr.start_date, fr.timespan);
                if( !flag ) mnTime = temp;
                if (temp > mnTime) mnTime = temp;
                flag = true;
            }


            if (!flag) {
                jobs_arr[i].start_date = today;
                job.start_date = today;
                currentCost[job.exec] += job.average_cost;
                entry_loc_dict[job.location].push(job);
                entry_exec_dict[job.exec].push(job);
            } else {
                let temp = toDateStr(mnTime);
                jobs_arr[i].start_date = temp;
                job.start_date = temp;
                currentCost[job.exec] += job.average_cost;
                entry_loc_dict[job.location].push(job);
                entry_exec_dict[job.exec].push(job);
            }

            if( !projectStartTime[ job.project_id ] ) {
                projectStartTime[ job.project_id ] = job.start_date;
                projectEndTime[ job.project_id ] = toDateStr( addYear(job.start_date,job.timespan) );
               // console.log( projectEndTime[job.project_id] );
            }
            if( job.start_date < projectStartTime[ job.project_id ] ) projectStartTime[ job.project_id ] = job.start_date;
            if( toDateStr( addYear(job.start_date,job.timespan) ) > projectEndTime[ job.project_id ] )
                projectEndTime[ job.project_id ] = toDateStr( addYear(job.start_date,job.timespan) );

           // let tempDate = new Date(jobs_arr[i].start_date);
           // tempDate = addYear(tempDate, jobs_arr[i].timespan);
           // if (tempDate > mxDate)
           //    mxDate = tempDate;
        }

      //  console.log(mxDate);
        //for(let i=0;i<jobs_arr.length;i++) console.log(jobs_arr[i].start_date);

        let projectsUpdate = await getTable('projects');

        let proposalsUpdate = await getTable("proposals");

        let merged = [];


        projectsUpdate.forEach(project => {
            project = {...project, type: 'project'};
            merged.push(project)
        })


        proposalsUpdate.forEach(proposal => {
            proposal = {...proposal, type: 'proposal'};
            merged.push(proposal)
        })

        cnt = 0;
        for(let i=0;i<merged.length;i++){
            let project = merged[i];

            merged[i].start_date = projectStartTime[ project.project_id ];
            merged[i].end_date = projectEndTime[ project.project_id ];
          //  merged[i].cost = projectEndTime[ project.project_id ];

            if( !project.end_date ) {
                project.end_date = today;
            }
           // console.log(merged[i].name,merged[i].exec, merged[i].start_date,projectsUpdate[i].end_date)
        }
      //   for(let i=0;i<10;i++) console.log(projectsUpdate[i].name,projectsUpdate[i].start_date,projectsUpdate[i].end_date);
     //   console.log(cnt);
        res.status(200).json(merged)
    }

}
module.exports = OptimizeController;