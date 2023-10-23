import frappe

@frappe.whitelist()
def get_Modules(project):
    
    project_doc = frappe.get_doc("Project EXP", project)
    modules = ['']

    for row in project_doc.module:
        modules.append(row.module)

   
    return modules


@frappe.whitelist()  # 
def support_query_Expedien_HOD(user=None):
    if not user:
        user = frappe.session.user
    value = frappe.db.get_value("User EXP", {"email_address": user}, "name")

    results = frappe.db.sql("""
        SELECT parent as project, STRING_AGG(module, ',') as modules
        FROM "tabManager Multiselect EXP"
        WHERE manager = %s
        GROUP BY parent;
    """, (value,), as_dict=True)
    project_modules = {row.project: row.modules.split(",") if row.modules else [] for row in results}
    return project_modules



@frappe.whitelist()
def generate_workflow_state_completed_count_query(user=None):
    if not user:
        user = frappe.session.user

    roles = frappe.get_roles(user)
    workflow_states = ['Close','Completed']

    if 'Expedien HOD' in roles:
        project_modules = support_query_Expedien_HOD(user)

        project_conditions = [
            "(project = '{project}' AND module IN ({modules_str}))".format(
                project=project,
                modules_str=", ".join([f"'{module}'" for module in modules])
            )
            for project, modules in project_modules.items()
        ]

        combined_conditions = [
            "({proj_cond} AND workflow_state IN ({states_str}))".format(
                proj_cond=proj_cond,
                states_str=", ".join([f"'{state}'" for state in workflow_states])
            )
            for proj_cond in project_conditions
        ]

        where_conditions = " OR ".join(combined_conditions)
        return where_conditions

    return ""  



@frappe.whitelist()
def generate_workflow_state_pending_count_query(user=None):
    if not user:
        user = frappe.session.user

    roles = frappe.get_roles(user)
    workflow_states = ['Submitted', 'Approved','In Progress']

    if 'Expedien HOD' in roles:
        project_modules = support_query_Expedien_HOD(user)

        project_conditions = [
            "(project = '{project}' AND module IN ({modules_str}))".format(
                project=project,
                modules_str=", ".join([f"'{module}'" for module in modules])
            )
            for project, modules in project_modules.items()
        ]

        combined_conditions = [
            "({proj_cond} AND workflow_state IN ({states_str}))".format(
                proj_cond=proj_cond,
                states_str=", ".join([f"'{state}'" for state in workflow_states])
            )
            for proj_cond in project_conditions
        ]

        where_conditions = " OR ".join(combined_conditions)
        return where_conditions

    return ""  



@frappe.whitelist()
def pending_and_completed_ticket_count(project=None, start_date=None, end_date=None):
    user = frappe.session.user
    result = ''
    where_clause_pending = generate_workflow_state_pending_count_query(user)
    where_clause_completed = generate_workflow_state_completed_count_query(user)
    counts = {}
    formatted_start_date = f"'{start_date}'" if start_date else "initialtion_datetime"
    formatted_end_date = f"'{end_date}'" if end_date else "initialtion_datetime"
    if not project:
        if where_clause_pending and where_clause_completed:
            distinct_project = get_distinct_projects(user)
            converted_string = str(distinct_project).replace('[', '(').replace(']', ')')
            
            

            query = f"""
                SELECT project, 
                    SUM(CASE WHEN {where_clause_pending} THEN 1 ELSE 0 END) as pending_count,
                    SUM(CASE WHEN {where_clause_completed} THEN 1 ELSE 0 END) as resolved_count
                FROM "tabSupport EXP"
                WHERE project IN {converted_string}
                AND (
                    initialtion_datetime BETWEEN COALESCE({formatted_start_date}, initialtion_datetime)
                    AND COALESCE({formatted_end_date}, initialtion_datetime)
                )
                GROUP BY project;
            """



            result = frappe.db.sql(query, as_dict=True)

            for row in result:
                project = row.project
                pending_count = row.pending_count
                resolved_count = row.resolved_count

                counts[project] = {"Pending": pending_count, "Resolved": resolved_count}

            return counts
        
    if project:
        if where_clause_pending and where_clause_completed:
            where_clause_for_module = get_distinct_modules(project)
            converted_string_module = str(where_clause_for_module).replace('[', '(').replace(']', ')')
            
            query_project = f"""
                SELECT module, 
                    SUM(CASE WHEN {where_clause_pending} THEN 1 ELSE 0 END) as pending_count,
                    SUM(CASE WHEN {where_clause_completed} THEN 1 ELSE 0 END) as resolved_count
                FROM `tabSupport EXP` 
                WHERE project = '{project}' AND module IN {converted_string_module} AND (
                    initialtion_datetime BETWEEN COALESCE({formatted_start_date}, initialtion_datetime)
                    AND COALESCE({formatted_end_date}, initialtion_datetime)
                )
                GROUP BY module;
            """

            result = frappe.db.sql(query_project, as_dict=True)

            for row in result:
                module = row.module
                pending_count = row.pending_count
                resolved_count = row.resolved_count

                counts[module] = {"Pending": pending_count, "Resolved": resolved_count}

            return counts

