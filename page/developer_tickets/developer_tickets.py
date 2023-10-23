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
			SELECT name 
			FROM `tabProject EXP`
			"""
		)

	return distinct_projects


@frappe.whitelist()
def get_developer_tickets(start_date_cl=None, end_date_cl=None, project=None):

    if not project:
        project = get_distinct_projects()
        project_list = ",".join(["%s"] * len(project))
    else:
        project_list = "%s"
        project = [project]

    start_date = frappe.utils.data.get_datetime(start_date_cl) if start_date_cl else frappe.utils.get_datetime('1900-01-01')
    end_date = frappe.utils.data.get_datetime(end_date_cl) if end_date_cl else frappe.utils.get_datetime('2999-12-31')

    user = frappe.session.user

    # if 'Expedien HOD' in frappe.get_roles(user):
    #     manager = frappe.db.get_value("User EXP", {"email_address": user}, "name")

    #     query = """
    #         SELECT developer as Developers, 
    #             SUM(CASE WHEN workflow_state IN ('Close', 'Completed') THEN 1 ELSE 0 END) AS "Completed Tickets",
    #             SUM(CASE WHEN workflow_state IN ('In Progress', 'Submitted','Approved') THEN 1 ELSE 0 END) AS "Pending Tickets",
    #             SUM(CASE WHEN workflow_state IN ('In Progress', 'Submitted', 'Close', 'Completed') THEN 1 ELSE 0 END) AS "Total Tickets"
    #         FROM "tabSupport EXP"
    #         WHERE developer IS NOT NULL 
    #               AND developer::varchar IN (SELECT developer::varchar FROM `tabDeveloper Multiselect EXP` WHERE parent = %s)
    #               AND (creation::DATE BETWEEN %s::DATE AND %s::DATE)
    #               AND project IN ({project_list}) 
    #         GROUP BY developer;
    #     """.format(project_list=project_list)

    #     result = frappe.db.sql(
    #         query,
    #         [manager, start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')] + project,
    #         as_dict=True,
    #     )
    if 'Expedien HOD' in frappe.get_roles(user):
        manager = frappe.db.get_value("User EXP", {"email_address": user}, "name")

        query = """
            SELECT developer as Developers, 
                SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS "Completed Tickets",
                SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) AS "Pending Tickets",
                SUM(CASE WHEN workflow_state IN ('In Progress', 'Submitted', 'Close', 'Completed','Approved','Assigned Work') THEN 1 ELSE 0 END) AS "Total Tickets"
            FROM "tabSupport EXP"
            WHERE developer IS NOT NULL 
                  AND developer::varchar IN (SELECT developer::varchar FROM `tabDeveloper Multiselect EXP` WHERE parent = %s)
                  AND (creation::DATE BETWEEN %s::DATE AND %s::DATE)
                  AND project IN ({project_list}) 
            GROUP BY developer;
        """.format(project_list=project_list)

        result = frappe.db.sql(
            query,
            [manager, start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')] + project,
            as_dict=True,
        )
    elif 'Support Super User' in frappe.get_roles(user):
        query = """
            SELECT developer as Developers, 
                SUM(CASE WHEN workflow_state IN ('Close', 'Completed') THEN 1 ELSE 0 END) AS "Completed Tickets",
                SUM(CASE WHEN workflow_state IN ('In Progress', 'Submitted','Assigned Work') THEN 1 ELSE 0 END) AS "Pending Tickets",
                SUM(CASE WHEN workflow_state IN ('In Progress', 'Submitted', 'Close', 'Completed','Assigned Work') THEN 1 ELSE 0 END) AS "Total Tickets"
            FROM "tabSupport EXP"
            WHERE developer IS NOT NULL
                  AND (creation::DATE BETWEEN %s::DATE AND %s::DATE)
                  AND project IN ({project_list})
            GROUP BY developer;
        """.format(project_list=project_list)

        result = frappe.db.sql(
            query,
            [start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')] + project,
            as_dict=True,
        )

    return result
