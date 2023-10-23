import frappe
from datetime import datetime

# @frappe.whitelist()    
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

    
    # return distinct_projects

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
    distinct_projects.insert(0,'')
    return distinct_projects

def get_project_condition(project, manager):
    if project:
        return f"AND project = '{project}'"
    else:
        distinct_projects = frappe.db.sql_list(
            """
            SELECT DISTINCT parent 
            FROM `tabManager Multiselect EXP` 
            WHERE manager = %(manager)s
            """,
            {'manager': manager}
        )
        if not distinct_projects:
            return "AND 1=0"  # This will ensure no results are returned if there are no projects for the manager
        return "AND project IN ({})".format(", ".join(["'{}'".format(p) for p in distinct_projects]))


@frappe.whitelist()
def get_completed_deliveries(start_date_cl, end_date_cl, project=None):

    start_date = frappe.utils.data.get_datetime(start_date_cl)
    end_date = frappe.utils.data.get_datetime(end_date_cl)

    user = frappe.session.user
    manager = frappe.db.get_value("User EXP", {"email_address": user}, "name")
    project_condition = get_project_condition(project, manager)

    query = f"""
        SELECT c.date, c.module, c.description
        FROM "tabCompleted Deliveries EXP" c
        INNER JOIN "tabWeekly Project Status EXP" w ON c.parent::varchar = w.name::varchar
        WHERE w.week_start_date::DATE BETWEEN %s::DATE AND %s::DATE {project_condition} AND w.docstatus = 1;

    """
    results = frappe.db.sql(query, (start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')), as_dict=True)
    # frappe.msgprint(query)
    return results

@frappe.whitelist()
def get_upcoming_deliveries(start_date_cl, end_date_cl, project=None):

    start_date = frappe.utils.data.get_datetime(start_date_cl)
    end_date = frappe.utils.data.get_datetime(end_date_cl)

    user = frappe.session.user
    manager = frappe.db.get_value("User EXP", {"email_address": user}, "name")
    project_condition = get_project_condition(project, manager)

    query = f"""
        SELECT u.date, u.module, u.description
        FROM "tabUpcoming Deliveries EXP" u
        INNER JOIN "tabWeekly Project Status EXP" w ON u.parent::varchar = w.name::varchar
        WHERE w.week_start_date::DATE BETWEEN %s::DATE AND %s::DATE {project_condition} AND w.docstatus = 1;
    """
    results = frappe.db.sql(query, (start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')), as_dict=True)
    return results

@frappe.whitelist()
def get_client_discussion(start_date_cl, end_date_cl, project=None):

    start_date = frappe.utils.data.get_datetime(start_date_cl)
    end_date = frappe.utils.data.get_datetime(end_date_cl)

    user = frappe.session.user
    manager = frappe.db.get_value("User EXP", {"email_address": user}, "name")
    project_condition = get_project_condition(project, manager)

    query = f"""
        SELECT d.user , d.type, d.discussion_details, d,target
        FROM "tabClient Discussion EXP" d
        INNER JOIN "tabWeekly Project Status EXP" w ON d.parent::varchar = w.name::varchar
        WHERE w.week_start_date::DATE BETWEEN %s::DATE AND %s::DATE {project_condition} AND w.docstatus = 1;
    """
    results = frappe.db.sql(query, (start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')), as_dict=True)
    return results





@frappe.whitelist()
def get_tickets(start_date_cl, end_date_cl, project=None):

    start_date = frappe.utils.data.get_datetime(start_date_cl)
    end_date = frappe.utils.data.get_datetime(end_date_cl)

    user = frappe.session.user
    manager = frappe.db.get_value("User EXP", {"email_address": user}, "name")
    project_condition = get_project_condition(project, manager)

    query = f"""
        SELECT sum(total_tickets) as total_tickets, sum(resolved_tickets) as resolved_tickets, sum(pending_tickets) as pending_tickets
        FROM "tabWeekly Project Status EXP"
        WHERE week_start_date::DATE BETWEEN %s::DATE AND %s::DATE {project_condition} AND docstatus = 1;
    """
    results = frappe.db.sql(query, (start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')), as_dict=True)
    return results



@frappe.whitelist()
def get_priority(start_date_cl, end_date_cl, project=None):

    start_date = frappe.utils.data.get_datetime(start_date_cl)
    end_date = frappe.utils.data.get_datetime(end_date_cl)

    user = frappe.session.user
    manager = frappe.db.get_value("User EXP", {"email_address": user}, "name")
    project_condition = get_project_condition(project, manager)

    query = f"""
        SELECT p.date, p.priority_level, p.description
        FROM "tabPriority EXP" p
        INNER JOIN "tabWeekly Project Status EXP" w ON p.parent::varchar = w.name::varchar
        WHERE w.week_start_date::DATE BETWEEN %s::DATE AND %s::DATE {project_condition}
    """
    results = frappe.db.sql(query, (start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')), as_dict=True)
    return results
