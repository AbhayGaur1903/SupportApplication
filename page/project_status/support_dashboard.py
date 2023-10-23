# import frappe

# @frappe.whitelist()    # Manager based distinct projects
# def get_distinct_projects(user=None):
#     if not user:
#         user = frappe.session.user
#     manager = frappe.db.get_value("User EXP", {"email_address": user}, "name")

#     distinct_projects = frappe.db.sql_list(
#         """
#         SELECT DISTINCT parent 
#         FROM `tabManager Multiselect EXP` 
#         WHERE manager = %(manager)s
#         """,
#         {'manager': manager}
#     )
#     distinct_projects.insert(0, '')

#     return distinct_projects

# @frappe.whitelist()    # Manager based distinct projects
# def get_projects(user=None):
#     if not user:
#         user = frappe.session.user
#     project = frappe.db.get_value("User EXP", {"email_address": user}, "project")

  
#     return project



# @frappe.whitelist()  # Manager and Project based distinct modules
# def get_distinct_modules(project):
#     user = frappe.session.user
#     manager = frappe.db.get_value("User EXP", {"email_address": user}, "name")
    
    
#     distinct_modules = frappe.db.sql_list(
#         """
#         SELECT DISTINCT module 
#         FROM `tabManager Multiselect EXP` 
#         WHERE parent = %(project)s 
#         AND manager = %(manager)s
#         """,
#         {'project': project, 'manager': manager}
#     )
#     return distinct_modules

# @frappe.whitelist()  # Manager and Project based distinct modules
# def get_modules(project):
#     user = frappe.session.user
#     project = frappe.db.get_value("User EXP", {"email_address": user}, "project")
    
    
#     distinct_modules = frappe.db.sql_list(
#         """
#         SELECT DISTINCT module 
#         FROM `tabModule Multiselect EXP` 
#         WHERE parent = %(project)s 
        
#         """,
#         {'project': project}
#     )
#     return distinct_modules

# @frappe.whitelist()  # 
# def support_query_Expedien_HOD(user=None):
#     if not user:
#         user = frappe.session.user
#     value = frappe.db.get_value("User EXP", {"email_address": user}, "name")

#     results = frappe.db.sql("""
#         SELECT parent as project, STRING_AGG(module, ',') as modules
#         FROM "tabManager Multiselect EXP"
#         WHERE manager = %s
#         GROUP BY parent;
#     """, (value,), as_dict=True)
#     project_modules = {row.project: row.modules.split(",") if row.modules else [] for row in results}
#     return project_modules


# @frappe.whitelist()  
# def support_query_not_Expedien_HOD(user=None):
#     if not user:
#         user = frappe.session.user
#     value = frappe.db.get_value("User EXP", {"email_address": user}, "project")

#     results = frappe.db.sql("""
#         SELECT parent as project, STRING_AGG(module, ',') as modules
#         FROM "tabManager Multiselect EXP"
#         WHERE parent = %s
#         GROUP BY parent;
#     """, (value,), as_dict=True)
#     project_modules = {row.project: row.modules.split(",") if row.modules else [] for row in results}
#     # frappe.msgprint(str(project_modules))
#     return project_modules


# @frappe.whitelist()
# def generate_workflow_state_completed_count_query(user=None):
#     project_modules = None
#     if not user:
#         user = frappe.session.user

#     roles = frappe.get_roles(user)
#     workflow_states = ['Close','Completed']

#     if 'Expedien HOD' in roles:
#         project_modules = support_query_Expedien_HOD(user)

#     else:
#         project_modules = support_query_not_Expedien_HOD(user)

#     project_conditions = [
#         "(project = '{project}' AND module IN ({modules_str}))".format(
#             project=project,
#             modules_str=", ".join([f"'{module}'" for module in modules])
#         )
#         for project, modules in project_modules.items()
#     ]

#     combined_conditions = [
#         "({proj_cond} AND workflow_state IN ({states_str}))".format(
#             proj_cond=proj_cond,
#             states_str=", ".join([f"'{state}'" for state in workflow_states])
#         )
#         for proj_cond in project_conditions
#     ]

#     where_conditions = " OR ".join(combined_conditions)
#     # frappe.msgprint(where_conditions)
#     return where_conditions

#     return ""  



# @frappe.whitelist()
# def generate_workflow_state_pending_count_query(user=None):
#     project_modules = None

#     if not user:
#         user = frappe.session.user

#     roles = frappe.get_roles(user)
#     workflow_states = ['Submitted', 'Approved','In Progress']

#     if 'Expedien HOD' in roles:
#         project_modules = support_query_Expedien_HOD(user)

#     else:
#         project_modules = support_query_not_Expedien_HOD(user)

#     project_conditions = [
#         "(project = '{project}' AND module IN ({modules_str}))".format(
#             project=project,
#             modules_str=", ".join([f"'{module}'" for module in modules])
#         )
#         for project, modules in project_modules.items()
#     ]

#     combined_conditions = [
#         "({proj_cond} AND workflow_state IN ({states_str}))".format(
#             proj_cond=proj_cond,
#             states_str=", ".join([f"'{state}'" for state in workflow_states])
#         )
#         for proj_cond in project_conditions
#     ]

#     where_conditions = " OR ".join(combined_conditions)
#     return where_conditions

#     return ""  

# @frappe.whitelist()
# def pending_and_completed_ticket_count(project=None, start_date=None, end_date=None):
#     user = frappe.session.user
#     roles = frappe.get_roles(user)
#     converted_string = None
#     result = ''
#     where_clause_pending = generate_workflow_state_pending_count_query(user)
#     where_clause_completed = generate_workflow_state_completed_count_query(user)
#     counts = {}
#     formatted_start_date = f"'{start_date}'" if start_date else "initialtion_datetime"
#     formatted_end_date = f"'{end_date}'" if end_date else "initialtion_datetime"
    
#     if not project:
#         if where_clause_pending and where_clause_completed:
#             distinct_project = get_distinct_projects(user)
#             if 'Expedien HOD' in roles: 
#                 converted_string = str(distinct_project).replace('[', '(').replace(']', ')')
#             else:
#                 project_single = frappe.db.get_value("User EXP", {"email_address": user}, "project")
#                 converted_string = f"('{project_single}')"
#             query = f"""
#                 SELECT project, 
#                     SUM(CASE WHEN {where_clause_pending} THEN 1 ELSE 0 END) as pending_count,
#                     SUM(CASE WHEN {where_clause_completed} THEN 1 ELSE 0 END) as resolved_count
#                 FROM "tabSupport EXP"
#                 WHERE project IN {converted_string}
#                 AND (
#                     initialtion_datetime BETWEEN COALESCE({formatted_start_date}, initialtion_datetime)
#                     AND COALESCE({formatted_end_date}, initialtion_datetime)
#                 )
#                 GROUP BY project;
#             """

#             result = frappe.db.sql(query, as_dict=True)

#             for row in result:
#                 project = row.project
#                 pending_count = row.pending_count
#                 resolved_count = row.resolved_count
#                 total_tickets = pending_count + resolved_count

#                 counts[project] = {"Pending": pending_count, "Resolved": resolved_count, "Total Tickets": total_tickets}

#             return counts
        
#     if project:
#         if where_clause_pending and where_clause_completed:
#             where_clause_for_module = get_distinct_modules(project)
#             converted_string_module = str(where_clause_for_module).replace('[', '(').replace(']', ')')
            
#             query_project = f"""
#                 SELECT module, 
#                     SUM(CASE WHEN {where_clause_pending} THEN 1 ELSE 0 END) as pending_count,
#                     SUM(CASE WHEN {where_clause_completed} THEN 1 ELSE 0 END) as resolved_count
#                 FROM `tabSupport EXP` 
#                 WHERE project = '{project}' AND module IN {converted_string_module} AND (
#                     initialtion_datetime BETWEEN COALESCE({formatted_start_date}, initialtion_datetime)
#                     AND COALESCE({formatted_end_date}, initialtion_datetime)
#                 )
#                 GROUP BY module;
#             """

#             result = frappe.db.sql(query_project, as_dict=True)

#             for row in result:
#                 module = row.module
#                 pending_count = row.pending_count
#                 resolved_count = row.resolved_count
#                 total_tickets = pending_count + resolved_count

#                 counts[module] = {"Pending": pending_count, "Resolved": resolved_count, "Total Tickets": total_tickets}

#             return counts


import frappe

@frappe.whitelist()
def get_distinct_projects(user=None):

    if not user:
        user = frappe.session.user

    manager = None

    roles = frappe.get_roles(user)

    if 'Expedien HOD' in roles:
        manager = frappe.db.get_value("User EXP", {"email_address": user}, "name")
        distinct_projects = frappe.db.sql_list(
            """
            SELECT DISTINCT parent 
            FROM `tabManager Multiselect EXP` 
            WHERE manager = %(manager)s
            """,
            {'manager': manager}
        )
    elif 'Support Super User' in roles:
        distinct_projects = frappe.db.sql_list(
            """
            SELECT DISTINCT name 
            FROM `tabProject EXP`
            """
        )

    distinct_projects.insert(0, '')

    return distinct_projects

# 



@frappe.whitelist()
def get_projects(user=None):
    if not user:
        user = frappe.session.user
    project = frappe.db.get_value("User EXP", {"email_address": user}, "project")

  
    return project



@frappe.whitelist()
def get_distinct_modules(project, user=None):

    if not user:
        user = frappe.session.user

    roles = frappe.get_roles(user)

    if 'Expedien HOD' in roles:
        manager = frappe.db.get_value("User EXP", {"email_address": user}, "name")
        distinct_modules = frappe.db.sql_list(
            """
            SELECT DISTINCT module 
            FROM `tabManager Multiselect EXP` 
            WHERE parent = %(project)s 
            AND manager = %(manager)s
            """,
            {'project': project, 'manager': manager}
        )
    elif 'Support Super User' in roles:
        distinct_modules = frappe.db.sql_list(
            """
            SELECT DISTINCT module 
            FROM `tabManager Multiselect EXP` 
            WHERE parent = %(project)s 
            """,
            {'project': project}
        )

    return distinct_modules


@frappe.whitelist() 
def get_modules(project):
    user = frappe.session.user
    project = frappe.db.get_value("User EXP", {"email_address": user}, "project")
    
    
    distinct_modules = frappe.db.sql_list(
        """
        SELECT DISTINCT module 
        FROM `tabModule Multiselect EXP` 
        WHERE parent = %(project)s 
        
        """,
        {'project': project}
    )
    return distinct_modules



@frappe.whitelist() 
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
def support_query_not_Expedien_HOD(user=None):
    if not user:
        user = frappe.session.user
    roles = frappe.get_roles(user)
    if 'Support Super User' in roles:
        value  = get_distinct_projects()
        value = str(value).replace('[', '(').replace(']', ')')

        


    else:
        value = frappe.db.get_value("User EXP", {"email_address": user}, "project")
        value = f'({value})'


    results = frappe.db.sql(f"""
        SELECT parent as project, STRING_AGG(module, ',') as modules
        FROM "tabManager Multiselect EXP"
        WHERE parent IN {value}
        GROUP BY parent;
    """, as_dict=True)
    project_modules = {row.project: row.modules.split(",") if row.modules else [] for row in results}
    return project_modules


@frappe.whitelist()
def generate_workflow_state_completed_count_query(user=None):
    project_modules = None
    if not user:
        user = frappe.session.user

    roles = frappe.get_roles(user)
    workflow_states = ['Close','Completed']

    if 'Expedien HOD' in roles:
        project_modules = support_query_Expedien_HOD(user)

    else:
        project_modules = support_query_not_Expedien_HOD(user)

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
    project_modules = None

    if not user:
        user = frappe.session.user

    roles = frappe.get_roles(user)
    workflow_states = ['Submitted', 'Approved','In Progress','Assigned Work']

    if 'Expedien HOD' in roles:
        project_modules = support_query_Expedien_HOD(user)

    else:
        project_modules = support_query_not_Expedien_HOD(user)

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
    roles = frappe.get_roles(user)
    converted_string = None
    result = ''
    where_clause_pending = generate_workflow_state_pending_count_query(user)
    where_clause_completed = generate_workflow_state_completed_count_query(user)
    counts = {}
    formatted_start_date = f"'{start_date}'" if start_date else "initialtion_datetime"
    formatted_end_date = f"'{end_date}'" if end_date else "initialtion_datetime"
    
    if not project:
        if where_clause_pending and where_clause_completed:
            distinct_project = get_distinct_projects(user)
            if 'Expedien HOD' in roles or 'Support Super User' in roles:
                converted_string = str(distinct_project).replace('[', '(').replace(']', ')')
            
            else:
                project_single = frappe.db.get_value("User EXP", {"email_address": user}, "project")
                converted_string = f"('{project_single}')"

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
                total_tickets = pending_count + resolved_count

                counts[project] = {"Pending": pending_count, "Resolved": resolved_count, "Total Tickets": total_tickets}

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
                total_tickets = pending_count + resolved_count

                counts[module] = {"Pending": pending_count, "Resolved": resolved_count, "Total Tickets": total_tickets}

            return counts

####################################################################################################################################################


# @frappe.whitelist()
# def get_support_exp_data(project=None, name=None, module=None, from_date=None, to_date=None, task_type=None, manager=None, start=0, page_length=10):
#     filters = {}

#     if project:
#         filters['project'] = project
#     if name:
#         filters['name'] = ["like", "%" + name + "%"]
#     if module:
#         filters['module'] = module
#     if task_type:
#         filters['task'] = task_type
#     if from_date and to_date:
#         filters['initialtion_datetime'] = ["between", [from_date, to_date]]

#     # Fetch the data
#     data = frappe.get_list('Support EXP', 
#                             filters=filters, 
#                             fields=['sequence', 'ticket_id', 'initialtion_datetime', 'actual_end_date', 'project', 'task', 'redmine_url', 'workflow_state', 'module', 'developer', 'subject', 'description', 'planned_start_date', 'estimated_hours', 'actual_hours', 'name'],
#                             start=start,
#                             page_length=page_length
#                            )
    
#     # Fetch the total count of records that match the filters
#     total = frappe.db.count('Support EXP', filters=filters)

#     # Return the data in the desired format
#     return {
#         'data': data,
#         'total': total
#     }

