# Copyright (c) 2023, Frappe Technologies and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document
from frappe.model.naming import make_autoname
from frappe import _
from frappe.utils import today, add_days




import os
        
class SupportEXP(Document):
    
    


        

    def validate(self):
        if self.workflow_state == 'Approved' or self.workflow_state == 'Submitted':
            planned_start_date = self.planned_start_date
            planned_end_date = self.planned_end_date
            Document.validate_from_to_dates(self,planned_start_date,planned_end_date)
        



    def on_update(self):
        has_workflow_state_changed(self)
        

    # def before_submit(self):
    #     if not self.rejection_comments_hod:
    #         frappe.throw('Please provide a reason for rejection.', title='Validation Error')



def get_ticket_id(project,name):
    # Extract the current date in MMDDYY format
    date = frappe.utils.nowdate()
    mmddyy = frappe.utils.formatdate(date, "MMddyy")

    # Create the series pattern
    series_pattern = "{0}-.####".format(project)

    raw_ticket_id = make_autoname(series_pattern)

    # Inject the MMDDYY into the raw ticket ID
    project_part, counter_part = raw_ticket_id.split("-")
    ticket_id = "{0}-{1}-{2}".format(project_part, mmddyy, counter_part)

    frappe.db.set_value("Support EXP", name, "ticket_id", ticket_id,update_modified=False)
    sequence= set_sequence(ticket_id,name)
    
    return ticket_id,sequence

def set_sequence(ticket_id,name):
    last_digits = int(ticket_id.rsplit("-", 1)[-1])
    frappe.db.set_value("Support EXP", name, "sequence", last_digits,update_modified=False)
    return last_digits

@frappe.whitelist()
def get_user_details():

    email_id = frappe.session.data.get('user')
    data = frappe.get_value("User EXP",{"email_address":email_id},['name','project'])
    return data  


@frappe.whitelist()
def add_shared_users(doctype, docname,add_user):
    list_lenght = len(add_user)
    for lenght in range(list_lenght):
        email = add_user[lenght]
        frappe.share.add(doctype, docname, email, read=1, write=1, share=1,submit=1)


@frappe.whitelist()
def get_managers(project, module):
    sql_query = """
        SELECT DISTINCT manager
        FROM `tabManager Multiselect EXP`
        WHERE parent = %s AND module = %s
    """
    managers = frappe.db.sql(sql_query, (project, module), as_list=True)
    manager_list = []
    for manager in managers:
        email_id = frappe.get_value("User EXP", manager[0], "email_address")
        if email_id:
            manager_list.append(email_id)

    
   
    return manager_list


@frappe.whitelist()
def get_onsite_users(doctype, txt, searchfield, start, page_len, filters):
    # Fetch usernames from the selected managers in Manager Multiselect EXP doctype
    query = """
        SELECT DISTINCT ue.name, mme.onsite
        FROM `tabUser EXP` ue
        INNER JOIN `tabManager Multiselect EXP` mme ON ue.name = mme.onsite
        WHERE mme.parent = %(project)s
        AND (LOWER(ue.name) LIKE %(txt)s OR LOWER(mme.onsite) LIKE %(txt)s);
    """
    
    result = frappe.db.sql(query, {"project": filters.get("project"), "txt": f"%{txt.lower()}%"}, as_dict=False)
    
    # Construct a list of usernames
    return result

@frappe.whitelist()
def get_project_manager(doctype, txt, searchfield, start, page_len, filters):
    email_id = frappe.session.data.get('user')
    data = frappe.get_value("User EXP", {"email_address": email_id}, ["name"])

    if not isinstance(data, dict):
        data = {"data": data}

    query = """
        SELECT DISTINCT ue.name, mme.parent
        FROM `tabProject EXP` ue
        INNER JOIN `tabManager Multiselect EXP` mme ON ue.name = mme.parent
        WHERE mme.manager = %(data)s
        AND (LOWER(ue.name) LIKE %(txt)s OR LOWER(mme.parent) LIKE %(txt)s);  -- Case-insensitive search
    """
    
    result = frappe.db.sql(query, {"data": data["data"], "txt": f"%{txt.lower()}%"}, as_dict=False)
    return result


@frappe.whitelist()
def get_project_onsite(doctype, txt, searchfield, start, page_len, filters):
    email_id = frappe.session.data.get('user')
    data = frappe.get_value("User EXP", {"email_address": email_id}, ["name"])

    if not isinstance(data, dict):
        data = {"data": data}



    query = """
        SELECT DISTINCT ue.name, mme.parent
        FROM `tabProject EXP` ue
        INNER JOIN `tabManager Multiselect EXP` mme ON ue.name = mme.parent
        WHERE LOWER(mme.onsite) = LOWER(%(data)s)
        AND (LOWER(ue.name) LIKE %(txt)s OR LOWER(mme.parent) LIKE %(txt)s);  -- Case-insensitive search
    """


    result = frappe.db.sql(query, {"data": data["data"].lower(), "txt": f"%{txt.lower()}%"}, as_dict=False)
    return result





@frappe.whitelist()
def get_manager_details():
    email_id = frappe.session.data.get('user')
    data = frappe.get_value("User EXP",{"email_address":email_id},['name'])
    return data 


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
def accept_and_save(doc_json):
    # Parse the provided JSON data
    doc_data = frappe.parse_json(doc_json)
    doc_name = doc_data.get("name")

    # Check if the document exists in the system
    if doc_name and frappe.db.exists('Support EXP', doc_name):
        doc = frappe.get_doc("Support EXP", doc_name)
    else:
        doc = frappe.new_doc("Support EXP")
        doc.update(doc_data)  # Update with the provided data
        doc.insert()  # Save the new document
        doc_name=doc.name

    # Update the workflow state using the apply_workflow function
    doc.workflow_state = "Submitted"
    doc.save()  # Reload the document to reflect the updated state

    # Return a meaningful message based on actions taken
    if doc_name:
        return {"message": "Existing document updated and accepted", "name": doc_name}
    else:
        return {"message": "New document created and accepted", "name": doc.name}








@frappe.whitelist()
def get_developers(doctype, txt, searchfield, start, page_len, filters):
    email = frappe.session.data.get('user')
    data = frappe.get_value("User EXP", {"email_address": email}, "name")

    if not isinstance(data, dict):
        data = {"data": data}

    query = """
        SELECT DISTINCT dm.developer
        FROM `tabDeveloper Multiselect EXP` dm
        WHERE dm.parent = %(data)s
        AND (LOWER(dm.developer) LIKE %(txt)s);
    """

    result = frappe.db.sql(query, {"data": data["data"], "txt": f"%{txt.lower()}%"}, as_dict=False)
    return result


@frappe.whitelist()
def get_Hod(project):
    hod = frappe.db.get_list('User EXP',
        filters={
            "project":project,
            "is_department_head":1
        },
        fields=["email_address"],
        pluck='email_address'
    )
 
    return hod

@frappe.whitelist()
def get_onsite(onsite_user):
    onsite = frappe.db.get_value('User EXP', onsite_user, 'email_address')
    
 
    return onsite

@frappe.whitelist()
def mark_complete_developer(docname):
    frappe.db.set_value("Support EXP",docname, "completed",1)

@frappe.whitelist()
def mark_in_progress(docname):
    frappe.db.set_value("Support EXP",docname,"workflow_state",'In Progress')
    


def has_workflow_state_changed(self):
    previous = self.get_doc_before_save()
    add_user = None  # Initialize the variable with None
    project = self.project
    module = self.module
    counter =0
    current_document = self.name
    onsite_user = self.onsite_user
    if previous:
        prev_workflow_state = previous.workflow_state
        current_workflow_state = self.workflow_state
        if prev_workflow_state == 'Draft' and current_workflow_state == 'Sent For Approval':
            # add_user = get_Hod(project)
            if(not self.project):
                frappe.throw("Project not found")
            elif(not self.module):
                frappe.throw("Module not found")    
            elif(not self.subject):
                frappe.throw("Subject not found")
            elif(not self.description):
                frappe.throw("Description not found")
            if not self.initialtion_datetime:
                self.initialtion_datetime = frappe.utils.now()
            counter +=1

        # elif (prev_workflow_state == 'Sent For Approval' or prev_workflow_state == 'On Hold') and current_workflow_state == 'Approved':
        #     # add_user=[]
        #     # onsite_users = get_onsite(onsite_user)
        #     # manager_user = get_managers(project,module)
        #     # frappe.db.set_value("Support EXP",current_document, "manager",str(manager_user),update_modified=False)
        #     add_user.append(onsite_users)
        #     add_user.extend(manager_user)

        elif (prev_workflow_state == 'Draft') and current_workflow_state == 'Submitted': 
            # add_user = []
            if(not self.project):
                frappe.throw("Project not found")
            elif(not self.module):
                frappe.throw("Module not found")    
            elif(not self.subject):
                frappe.throw("Subject not found")
            elif(not self.description):
                frappe.throw("Description not found")
            
            # manager_user = []
            # hod_user = get_Hod(project)
            
            # # Check if "Onsite" is not present in self.user
            # if "Onsite" not in self.user:
            #     onsite_users = get_onsite(onsite_user)
            #     add_user.append(onsite_users)
            
            # # Check if "EXP" is not present in self.user
            # if "EXP" not in self.user:
            #     manager_user = get_managers(project, module)
            #     frappe.db.set_value("Support EXP", current_document, "manager", str(manager_user),update_modified=False)

            # add_user.extend(manager_user)
            # add_user.extend(hod_user)
            if not self.initialtion_datetime:
                self.initialtion_datetime = frappe.utils.now()
            counter +=1
        
            
        elif (prev_workflow_state == 'Draft') and current_workflow_state == 'Approved':
            # add_user=[]
            if(not self.project):
                frappe.throw("Project not found")
            elif(not self.module):
                frappe.throw("Module not found")    
            elif(not self.subject):
                frappe.throw("Subject not found")
            elif(not self.description):
                frappe.throw("Description not found")
            
            # onsite_users = get_onsite(onsite_user)
            # manager_user = get_managers(project,module)
            # frappe.db.set_value("Support EXP",current_document, "manager",str(manager_user),update_modified=False)
            # add_user.append(onsite_users)
            # add_user.extend(manager_user)
            if not self.initialtion_datetime:
                self.initialtion_datetime = frappe.utils.now()
            counter +=1
        elif ((prev_workflow_state == 'Submitted') and (current_workflow_state == 'Completed' or current_workflow_state == 'Assigned Work')):
            if (not self.developer):
                frappe.throw("Developer Manadatory")

        # elif ((prev_workflow_state == 'Submitted') and (current_workflow_state == 'Completed' or current_workflow_state == 'Assigned Work')):
        #     if not self.rejection_comments_hod:
        #         frappe.throw("Fill ")

            
    # if add_user:
        # add_shared_users('Support EXP', self.name, add_user)
    if counter>0:
        ticket_id,sequence = get_ticket_id(self.project, self.name)
        self.ticket_id = ticket_id
        self.sequence = sequence
        self.save()

@frappe.whitelist()
def capture(file=None):
    docname = frappe.get_request_header("Referer").split("/")[-1]
    student = frappe.get_doc("Support EXP", docname)
    state = student.project
    # student_name = student.ticket_id

    file_content = frappe.local.uploaded_file
    file_name_old = frappe.local.uploaded_filename
    file_name = f"{state}-{file_name_old}"
    

    
    folder_path = f"/home/support/frappe-bench/sites/Expedien.Support/public/files/{state}"
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(folder_path, file_name)


    with open(file_path, "wb") as file:
        file.write(file_content)
    
    new_file_path = f"/files/{state}/{file_name}"
    sys_file_path = f"/files/{state}/{file_name}"
    email_id = frappe.session.data.get('user')

    file_doc = frappe.new_doc("File")
    file_doc.name = "random"
    file_doc.file_name = file_name
    file_doc.file_url = new_file_path
    file_doc.attached_to_name = docname
    file_doc.folder = "Home"
    file_doc.attached_to_doctype = "Support EXP"
    file_doc.attached_to_field = 'attach'
    file_doc.attached_by = email_id


    file_doc.insert()

    frappe.db.set_value("File", file_doc.name, "file_url", f"{sys_file_path}")

    

    return file_path

@frappe.whitelist()
def capture_completion(file=None):
    docname = frappe.get_request_header("Referer").split("/")[-1]
    student = frappe.get_doc("Support EXP", docname)
    state = student.project
    student_name = student.ticket_id

    file_content = frappe.local.uploaded_file
    file_name_old = frappe.local.uploaded_filename
    file_name = f"Completed--{student_name}-{file_name_old}"
    

    
    folder_path = f"/home/support/frappe-bench/sites/Expedien.Support/public/files/{state}"
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(folder_path, file_name)


    with open(file_path, "wb") as file:
        file.write(file_content)
    
    new_file_path = f"/files/{state}/{file_name}"
    sys_file_path = f"/files/{state}/{file_name}"
    email_id = frappe.session.data.get('user')

    file_doc = frappe.new_doc("File")
    file_doc.name = "random"
    file_doc.file_name = file_name
    file_doc.file_url = new_file_path
    file_doc.attached_to_name = docname
    file_doc.folder = "Home"
    file_doc.attached_to_doctype = "Support EXP"
    file_doc.attached_to_field = 'attach'
    file_doc.attached_by = email_id


    file_doc.insert()

    frappe.db.set_value("File", file_doc.name, "file_url", f"{sys_file_path}")

    

    return file_path



@frappe.whitelist()
def get_attached_files(docname):
    # let html = "";

    attached_files = frappe.db.get_list('File',
                            filters={
                                'attached_to_name': docname
                            },
                            fields=['name', 'file_name', 'file_url', 'attached_by'],
                            as_list=True
                        )

    html = "<div style='padding-bottom: 20px;'>"
    html += "<table style='border-collapse: collapse; border: 2px solid #039dfc;'>"
    html += "<tr><th style='border: 1px solid #039dfc; background-color: #039dfc; color: white; padding: 10px;'>Attachment</th><th style='border: 1px solid #039dfc; background-color: #039dfc; color: white; padding: 10px;'>User</th><th style='border: 1px solid #039dfc; background-color: #039dfc; color: white; padding: 10px;'>Actions</th></tr>"
    
    for file_data in attached_files:
        file_id = file_data[0]
        file_name = file_data[1]
        file_url = file_data[2]
        email_id = file_data[3]
        
        button_html = '<button class="modern-button" onclick="window.open(\'{url}\')" type="button">{name}</button>'.format(url=file_url, name=file_name)
        delete_button_html = '<button class="delete-button" data-file-id="{id}" type="button">Delete</button>'.format(id=file_id)
        
        row_html = "<tr><td style='border: 1px solid #039dfc; padding: 10px;'>{}</td><td style='border: 1px solid #039dfc; padding: 10px;'>{}</td><td style='border: 1px solid #039dfc; padding: 10px;'>{}</td></tr>".format(button_html, email_id, delete_button_html)
        html += row_html

    # Add CSS styles for modern button and delete button look
    css = '<style>button.modern-button { background-color: #039dfc; color: white; border: none; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px; } button.delete-button { background-color: #ff0000; color: white; border: none; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px; }</style>'
    html_with_styles = css + html + "</table></div>"
    
    return html_with_styles

from frappe import _

@frappe.whitelist()
def delete_file(file_id):
    # Check if the user has the role of Administrator
    # if "Expedien HOD" not in frappe.get_roles():
    #     return frappe.throw(_("You don't have the required permissions to delete the file."), title="Permission Error")

    # Delete the file document
    frappe.delete_doc('File', file_id)

    # You may want to add some error handling in case the delete operation fails.

    return frappe.msgprint("File deleted successfully")


@frappe.whitelist()
def delete_draft_doc(docname):
    frappe.delete_doc('Support EXP', docname)

    return frappe.msgprint("Support Document Deleted")


    

@frappe.whitelist()
def add_docshare():
    # Define the document type as 'Support EXP'
    doctype = 'Support EXP'
    
    # Fetch all records where project is 'DHSGU' and onsite is 'Subhash/Onsite/DHSGU'
    
    records = frappe.get_all(doctype, filters={'project': 'EXP HRMS'})

    # Replace email with the email address you want to share the document with
    email = 'sangeet@expediens.com'
    
    
    for record in records:
        docname = record.name
        frappe.share.add(doctype, docname, email, read=1, write=1, share=1, submit=1)
    
        # Show a message indicating that the share permissions have been added
    frappe.msgprint(f"Added share permissions for documents.{len(records)}")



############################################################################################################################
#ROUGH CODE


# @frappe.whitelist()
# def add_docshare():
#     from frappe import share, msgprint

#     # Define the document type as 'Support EXP'
#     doctype = 'Support EXP'
    

#     # Mapping of docnames to manager emails


#     for docname, emails in docnames_with_emails.items():
#         for email in emails:
#             share.add(doctype, docname, email, read=1, write=1, share=1, submit=1)

#     msgprint(f"Added share permissions for {len(docnames_with_emails)} documents.")





# @frappe.whitelist()
# def get_Modules(project):
#     project = frappe.get_doc("Project EXP", project)
#     modules=['']
    
#     for row in project.module:
#          modules.append(row.module)
    
    
    

#     return modules       

# def has_workflow_state_changed(self):
#     previous = self.get_doc_before_save()
#     add_user = None  # Initialize the variable with None
#     project = self.project
#     if previous:
#         prev_workflow_state = previous.workflow_state
#         current_workflow_state = self.workflow_state
#         if prev_workflow_state == 'Draft' and current_workflow_state == 'Sent For Approval':
#             add_user=[]
#             onsite_users = get_onsite(self.onsite_user)
#             manager_user = get_managers(project)
#             add_user.append(onsite_users)
#             add_user.append(manager_user)
#             add_user_flat = [add_user[0]]  # Initialize the flat list with the first email address
#             add_user_flat.extend(add_user[1])  # Extend the flat list with the remaining email addresses
#             frappe.msgprint(str(add_user_flat))
            
#             # add_user = get_Hod(project)
#         # elif prev_workflow_state == 'Draft' and current_workflow_state == 'Sent For Approval':
#         #     add_user = get_onsite(project)  
#         elif (prev_workflow_state == 'Sent For Approval' or prev_workflow_state == 'On Hold') and current_workflow_state == 'Approved':
#             add_user = []
#             onsite_users = get_onsite(project)
#             manager_user = get_managers(project)
#             add_user.append(onsite_users)
#             add_user.append(manager_user)
#             frappe.msgprint(str(add_user))
            

#     if add_user:
#         add_shared_users('Support EXP', self.name, add_user)


# @frappe.whitelist()
# def generate_excel(filters):
#     data = get_support_exp_data(filters)  # Replace with your data fetching logic

#     # Create a new Excel workbook
#     workbook = Workbook()
#     worksheet = workbook.active

#     # Define headers
#     headers = ["Name", "Module", "Initiation Date", "Subject", "Description", "Task", "Working Hours", "Developer", "Completion Date", "Status"]

#     # Write headers with formatting
#     for col_idx, header in enumerate(headers, start=1):
#         cell = worksheet.cell(row=1, column=col_idx, value=header)
#         cell.font = Font(bold=True)
#         cell.alignment = Alignment(horizontal='center', vertical='center')

#     # Write data rows
#     for row_idx, item in enumerate(data, start=2):
#         values = [item.get("name"), item.get("module"), item.get("initialtion_datetime"), item.get("subject"),
#                   item.get("description"), item.get("task"), item.get("actual_hours"), item.get("developer"),
#                   item.get("actual_end_date"), item.get("workflow_state")]

#         for col_idx, value in enumerate(values, start=1):
#             cell = worksheet.cell(row=row_idx, column=col_idx, value=value)

#     # Save the workbook to a BytesIO buffer
#     excel_buffer = BytesIO()
#     workbook.save(excel_buffer)

#     # Return the Excel data as a base64-encoded string
#     # Server-side Python code
#     return frappe.safe_encode(excel_buffer.getvalue().strip())


# @frappe.whitelist()
# def add_docshare():
#     # Define the document type as 'Support EXP'
#     doctype = 'Support EXP'
    
#     # Fetch all records where project is 'DHSGU' and onsite is 'Subhash/Onsite/DHSGU'
#     # records = frappe.get_all(doctype, filters={'project': 'RTU BECIL'})
#     records = ['BSEB-00256','BSEB-00257','BSEB-00258','BSEB-00259',]
    
#     # Replace email with the email address you want to share the document with

    
#     for record in records:
#         # Get the docname for each record
#         docname = record
#         number_part = docname.split("-")[1]
#         number = int(number_part)
#         email = 'sangeet@expediens.com'
        
#         # Add the share permission for the specified document and email
#         frappe.share.add(doctype, docname, email, read=1, write=1, share=1, submit=1)
#         # frappe.db.set_value("Support EXP",docname, "sequence",number)
    
#     # Show a message indicating that the share permissions have been added
#     frappe.msgprint(f"Added share permissions for {len(records)} documents.")
  
    


# @frappe.whitelist()
# def add_docshare():
#     # Define the document type as 'Support EXP'
#     doctype = 'Support EXP'
    
#     # Fetch all records where project is 'DHSGU' and onsite is 'Subhash/Onsite/DHSGU'
#     records_subhash = frappe.get_all(doctype, filters={'project': 'DHSGU', 'onsite_user': 'Subhash/Onsite/DHSGU'})
#     records_gopal = frappe.get_all(doctype, filters={'project': 'DHSGU', 'onsite_user': 'Gopal/Onsite/DHSGU'})
    
#     # Define email addresses based on onsite_user values
#     email_subhash = 'sthakur1@expediens.com'
#     email_gopal = 'gkumar3@expediens.com'
    
#     # Add share permissions for Subhash
#     for record in records_subhash:
#         docname = record.name
#         frappe.share.add(doctype, docname, email_subhash, read=1, write=1, share=1, submit=1)
    
#     # Add share permissions for Gopal
#     for record in records_gopal:
#         docname = record.name
#         frappe.share.add(doctype, docname, email_gopal, read=1, write=1, share=1, submit=1)
    
#     # Show a message indicating that the share permissions have been added
#     total_records = len(records_subhash) + len(records_gopal)
#     frappe.msgprint(f"Added share permissions for {total_records} documents.")





# @frappe.whitelist()
# def custom_list_doc(manager=None):
#     email = 'sangeet@expediens.com'
    
#     # Get the share_names for the user
#     share_names = [d.share_name for d in frappe.db.get_all("DocShare", filters={"user": email}, fields=["share_name"])]
    
#     # Convert share_names to a format suitable for SQL
#     share_names_str = ', '.join([frappe.db.escape(name) for name in share_names])
    
#     # Write the custom query
#     query = """
#     SELECT name
#     FROM `tabSupport EXP`
#     WHERE owner = %s
#     OR name IN ({})
#     """.format(share_names_str)

#     # Execute the custom query
#     records = frappe.db.sql(query, email, as_dict=True)

#     # Do something with the records, for example, print the count
#     for record in records:
#         print(record)



# @frappe.whitelist()
# def get_attached_files(docname):
#     attached_files = frappe.db.get_list('File',
#                             filters={
#                                 'attached_to_name': docname
#                             },
#                             fields=['file_name','file_url','attached_by'],
#                             as_list=True
#                         )

#     html = "<div style='padding-bottom: 20px;'>"
#     html += "<table style='border-collapse: collapse; border: 2px solid #039dfc;'>"
#     html += "<tr><th style='border: 1px solid #039dfc; background-color: #039dfc; color: white; padding: 10px;'>Attachment</th><th style='border: 1px solid #039dfc; background-color: #039dfc; color: white; padding: 10px;'>User</th></tr>"
#     for file_data in attached_files:
#         file_name = file_data[0]
#         file_url = file_data[1]
#         email_id = file_data[2]
#         button_html = '<button class="modern-button" onclick="window.open(\'{url}\')" type="button">{name}</button>'.format(url=file_url, name=file_name)
#         row_html = "<tr><td style='border: 1px solid #039dfc; padding: 10px;'>{}</td><td style='border: 1px solid #039dfc; padding: 10px;'>{}</td></tr>".format(button_html, email_id)
#         html += row_html

#     # Add CSS styles for modern button look
#     css = '<style>button.modern-button { background-color: #039dfc; color: white; border: none; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px; }</style>'
#     html_with_styles = css + html + "</table></div>"
    
#     return html_with_styles



@frappe.whitelist()
def get_support_exp_data(project=None, name=None, module=None, from_date=None, to_date=None, task_type=None, manager=None,status=None, aging_report=False,ageDays=None):
    filters = {}

    if project:
        filters['project'] = project
    if name:
        filters['name'] = ["like", "%" + name + "%"]
    if module:
        filters['module'] = module
    if task_type:
        filters['task'] = task_type
    if status:
        filters['workflow_state'] = status

    if from_date and to_date:
        filters['initialtion_datetime'] = ["between", [from_date, to_date]]
    
    # Add aging report filters
    # ... Previous code ...

    if aging_report:
        if ageDays:
            aging_date = add_days(today(), -int(ageDays))
        else:
            aging_date = add_days(today(), -3)  # This fetches the date 7 days ago.
        filters['initialtion_datetime'] = ["<", aging_date]
        filters['developer'] = ["in", (None, '')]
        filters['workflow_state']=["in",('Submitted')]

# ... Rest of the code ...


    data = frappe.get_list('Support EXP', filters=filters, fields=['sequence','ticket_id','user','initialtion_datetime','actual_end_date', 'project', 'task','redmine_url','workflow_state','module','priority', 'developer', 'subject', 'description', 'planned_start_date','estimated_hours','actual_hours','name'], page_length=50000)
    
    return data






@frappe.whitelist()
def get_distinct_projects():
    distinct_projects = frappe.db.sql_list("SELECT DISTINCT project FROM `tabSupport EXP`")
    return distinct_projects

@frappe.whitelist()
def get_distinct_modules():
    distinct_modules = frappe.db.sql_list("SELECT DISTINCT module FROM `tabSupport EXP`")
    return distinct_modules




















