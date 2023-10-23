# Copyright (c) 2023, Frappe Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.naming import make_autoname

class WeeklyProjectStatusEXP(Document):
    # def before_save(self):
    #     email_id = frappe.session.data.get('user')        
    #     project = frappe.get_value("User EXP", {"email_address": email_id}, ['project'])
    #     self.project = project
        
    def before_submit(self):
        project = self.project
        add_user = []
        ticket_id = get_ticket_id(self.project,self.name)
        self.report_id = ticket_id
        manager_user = get_managers(project)
        add_user.extend(manager_user)
        if add_user:
            add_shared_users('Weekly Project Status EXP', self.name, add_user)


def get_ticket_id(project,name):
    # Extract the current date in MMDDYY format
    date = frappe.utils.nowdate()
    mmddyy = frappe.utils.formatdate(date, "MMddyy")

    # Create the series pattern
    series_pattern = "WSR-.#####"

    raw_ticket_id = make_autoname(series_pattern)

    # Inject the MMDDYY into the raw ticket ID
    project_part, counter_part = raw_ticket_id.split("-")
    ticket_id = "{0}-{2}-{1}{3}".format(project_part, project, mmddyy, counter_part)

    frappe.db.set_value("Weekly Project Status EXP", name, "report_id", ticket_id,update_modified=False)
    # sequence= set_sequence(ticket_id,name)
    
    return ticket_id           


@frappe.whitelist()
def get_managers(project):
    sql_query = """
        SELECT DISTINCT manager
        FROM `tabManager Multiselect EXP`
        WHERE parent = %s 
    """
    managers = frappe.db.sql(sql_query, (project), as_list=True)
    manager_list = []
    for manager in managers:
        email_id = frappe.get_value("User EXP", manager[0], "email_address")
        if email_id:
            manager_list.append(email_id)

    
   
    return manager_list
        
        
@frappe.whitelist()
def add_shared_users(doctype, doc_name,add_user):
    list_lenght = len(add_user)
    for lenght in range(list_lenght):
        email = add_user[lenght]
        frappe.share.add(doctype, doc_name, email, read=1, write=1, share=1,submit=1)     
        
	


@frappe.whitelist()
def get_Modules(project):
    
    
    # Get the distinct module names from the Manager Multiselect EXP where parent = project
    module_list = frappe.get_all("Manager Multiselect EXP", 
                                filters={'parent': project}, 
                                fields=["distinct(module) as module_name"],
                                order_by=None)  
                                
    # Extract the module names into a list
    modules = [d.module_name for d in module_list]
    modules.insert(0, '')

    return modules





@frappe.whitelist()
def get_ticket_counts(week_start_date, week_end_date,project):
    
    
              
    # Query to get priority counts
    priority_query = """
    SELECT priority, COUNT(*) AS count
    FROM "tabSupport EXP"
    WHERE
        initialtion_datetime >= %s AND initialtion_datetime < %s::date + INTERVAL '1 day'
        AND workflow_state IN ('In Progress','Approved', 'Submitted', 'Completed', 'Close')
        AND project = %s
    GROUP BY priority;
    """
    
    # Query to get separate counts for "Close" and "Completed"
    resolved_query = """
    SELECT
        COUNT(CASE WHEN workflow_state = 'In Progress' THEN 1 END) AS inprogress_tickets,
        COUNT(CASE WHEN workflow_state = 'Approved' THEN 1 END) AS approved_tickets,
        COUNT(CASE WHEN workflow_state = 'Submitted' THEN 1 END) AS accepted_tickets,
        COUNT(CASE WHEN workflow_state = 'Close' THEN 1 END) AS close_tickets,
        COUNT(CASE WHEN workflow_state = 'Completed' THEN 1 END) AS completed_tickets
    FROM "tabSupport EXP"
    WHERE
        initialtion_datetime >= %s AND initialtion_datetime < %s::date + INTERVAL '1 day'
        AND workflow_state IN ('Close', 'Completed','In Progress','Approved','Submitted')
        AND project = %s;
    """

    priority_results = frappe.db.sql(priority_query, (week_start_date, week_end_date, project), as_dict=True)
    resolved_results = frappe.db.sql(resolved_query, (week_start_date, week_end_date, project), as_dict=True)

    # Create a dictionary for priority counts
    priority_counts = {}
    for row in priority_results:
        priority_counts[row['priority']] = row['count']

    # Add resolved tickets to the result
    if resolved_results:
        priority_counts["In Progress"] = resolved_results[0]['inprogress_tickets']
        priority_counts["Approved"] = resolved_results[0]['approved_tickets']
        priority_counts["Submitted"] = resolved_results[0]['accepted_tickets']
        priority_counts["Close"] = resolved_results[0]['close_tickets']
        priority_counts["Completed"] = resolved_results[0]['completed_tickets']

        
    # frappe.msgprint(str(priority_counts))

    return priority_counts


@frappe.whitelist()
def get_completed_tickets_count(start_date, end_date, project):
	query = """
	SELECT "priority", COUNT(name) as CompletedTicketCount
	FROM `tabSupport EXP`
	WHERE (workflow_state = 'Completed' OR workflow_state = 'Close')
	AND initialtion_datetime BETWEEN %(start_date)s AND %(end_date)s
	AND project = %(project)s
	GROUP BY "priority"
	"""
	tickets = frappe.db.sql(query, {
	"start_date": start_date,
	"end_date": end_date,
	"project": project
	}, as_dict=True) # Change as_list=True to as_dict=True
	html_table = generate_tickets_count_table(tickets)
	return html_table

@frappe.whitelist()
def get_pending_tickets_count(start_date, end_date, project):
	query = """
	SELECT "priority", COUNT(name) as CompletedTicketCount
	FROM `tabSupport EXP`
	WHERE (workflow_state = 'Submitted' OR workflow_state = 'Approved' OR workflow_state = 'In Progress')
	AND initialtion_datetime BETWEEN %(start_date)s AND %(end_date)s
	AND project = %(project)s
	GROUP BY "priority"
	"""
	tickets = frappe.db.sql(query, {
	"start_date": start_date,
	"end_date": end_date,
	"project": project
	}, as_dict=True) # Change as_list=True to as_dict=True
	html_table = generate_tickets_count_table(tickets)
	return html_table

@frappe.whitelist()
def generate_tickets_count_table(tickets):
	table_html = "<table style=\"border-collapse: collapse; width: 100%;\">"
	table_html += "<tr><th style=\"border: 1px solid black; padding: 8px;\">Priority</th>"
	table_html += "<th style=\"border: 1px solid black; padding: 8px;\">Ticket Count</th></tr>"

	for ticket in tickets:
		priority = ticket['priority']
		completed_count = ticket['completedticketcount']
		table_html += "<tr>"
		table_html += f"<td style=\"border: 1px solid black; padding: 8px;\">{priority}</td>"
		table_html += f"<td style=\"border: 1px solid black; padding: 8px;\">{completed_count}</td>"
		table_html += "</tr>"
	table_html += "</table>"
	return table_html


@frappe.whitelist()
def set_session_data(week_start_date, week_end_date, project):
    session = frappe.session

    # Convert datetime strings to datetime objects
    week_start_date = frappe.datetime.strptime(week_start_date, '%Y-%m-%d')
    week_end_date = frappe.datetime.strptime(week_end_date, '%Y-%m-%d')

    # Store them as strings in the session data
    session.week_start_date = week_start_date.strftime('%Y-%m-%d')
    session.week_end_date = week_end_date.strftime('%Y-%m-%d')
    session.project = project

    frappe.msgprint(str(session))
    return session

###################################################################################################
#ROUGH CODE
# @frappe.whitelist()
# def get_ticket_counts(week_start_date, week_end_date, doc_name):
#     # Get the project associated with the email ID
#     email_id = frappe.session.data.get('user')
#     project = frappe.get_value("User EXP", {"email_address": email_id}, ['project'])
    
#     # SQL query with a project filter
#     query = """
#     SELECT priority, COUNT(*) AS count
#     FROM "tabSupport EXP"
#     WHERE
#         initialtion_datetime >= %s AND initialtion_datetime < %s::date + INTERVAL '1 day'
#         AND workflow_state IN ('Approved', 'Submitted', 'Completed', 'Close')
#         AND project = %s
#     GROUP BY priority;
#     """

#     # Execute the query with the project parameter
#     results = frappe.db.sql(query, (week_start_date, week_end_date, project), as_dict=True)
    
#     # Initialize a dictionary to store the counts
#     ticket_counts = {
#         "Low": 0,
#         "Medium": 0,
#         "High": 0
#     }
    
#     # Process the results to fill the ticket_counts dictionary
#     for result in results:
#         priority = result['priority']
#         count = result['count']
#         if priority in ticket_counts:
#             ticket_counts[priority] += count
    
#     # Calculate the sum using Python
#     total_tickets = sum(ticket_counts.values())
    
#     # You can return both the individual counts and the total
#     ticket_counts['total_tickets'] = total_tickets
    
#     # Print the results or perform other actions as needed
#     frappe.msgprint(str(ticket_counts))

#     return ticket_counts

# @frappe.whitelist()
# def get_resolved_counts(week_start_date, week_end_date,project):
   
#     # Query to get the breakdown of resolved tickets based on their priorities
#     resolved_priority_query = """
#     SELECT priority, COUNT(*) AS count
#     FROM "tabSupport EXP"
#     WHERE
#         initialtion_datetime >= %s AND initialtion_datetime < %s::date + INTERVAL '1 day'
#         AND workflow_state IN ('Close', 'Completed')
#         AND project = %s
#     GROUP BY priority;
#     """

#     resolved_priority_results = frappe.db.sql(resolved_priority_query, (week_start_date, week_end_date, project), as_dict=True)

#     # Convert the results to a dictionary for easy access
#     resolved_priority_counts = {row['priority']: row['count'] for row in resolved_priority_results}

#     frappe.msgprint(str(resolved_priority_counts))

#     return resolved_priority_counts