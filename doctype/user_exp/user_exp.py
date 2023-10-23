# Copyright (c) 2023, Frappe Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class UserEXP(Document):
    def before_insert(self):
        if(self.is_manager):
            self.auto_id = f"{self.name1}/EXP"
        elif(self.is_developer):
            self.auto_id = f"{self.name1}/DEV"
        elif(self.is_department_head):
            self.auto_id = f"{self.name1}/InCharge/{self.project}"
        elif(self.is_onsite):
            self.auto_id = f"{self.name1}/Onsite"   
        elif(self.is_coordinator):
            self.auto_id = f"{self.name1}/Coordinator/{self.project}"
        else:
            self.auto_id = f"{self.name1}/{self.project}"
        user_fname = self.name1
        user_lname = ''
        user_mobile = self.mobile_number
        user_email = self.email_address
        user_isManager = self.is_manager
        user_is_department_head = self.is_department_head
        user_is_onsite  = self.is_onsite  
        user_is_coordinator = self.is_coordinator
        user_is_dev = self.is_developer    
        if self.email_address:
            make_user(user_fname,user_lname,user_mobile,user_email,user_isManager,user_is_department_head,user_is_onsite,user_is_coordinator,user_is_dev)
                



      
        
     
def update_user(doc_user):
        doc_user.save()
        frappe.db.set_value("User", doc_user.name, "user_type", "System User")
        frappe.msgprint("User Created")

@frappe.whitelist()
def make_user(user_fname, user_lname, user_mobile,user_email,user_isManager,user_is_department_head,user_is_onsite,user_is_coordinator,user_is_dev):
    # check if record already exists
    if frappe.db.exists("User", {"first_name": user_fname, "email": user_email}):
        frappe.throw("User already exists")

    doc_user= frappe.new_doc("User")
    doc_user.first_name = user_fname
    # doc_user.last_name = user_lname
    doc_user.mobile_no = user_mobile
    doc_user.email = user_email
    doc_user.enabled = True
    doc_user.owner = "Administrator"
    doc_user.user_type = "System User"
    doc_user.new_password = "root@123"
    doc_user.role_profile_name = "Support Users"
    doc_user.module_profile = "Support"
    doc_user.send_welcome_email = 0
    
    doc_user.save()

    frappe.db.set_value("User", doc_user.name, "modified_by", "Administrator")
    frappe.db.set_value("User", doc_user.name, "owner", "Administrator")
    frappe.db.set_value("User", doc_user.name, "user_type", "System User")
    if(user_isManager == 1):
        frappe.db.set_value("User", doc_user.name, "role_profile_name", "Expedien HODs")
    elif(user_is_department_head == 1):   
        frappe.db.set_value("User", doc_user.name, "role_profile_name", "Department HODs")
    elif(user_is_onsite == 1):
        frappe.db.set_value("User", doc_user.name, "role_profile_name", "Onsite Users")
    elif(user_is_coordinator == 1):
        frappe.db.set_value("User", doc_user.name, "role_profile_name", "Project Coordinator Users")
    elif(user_is_dev == 1):
        frappe.db.set_value("User", doc_user.name, "role_profile_name", "Support Developer Users")
    else:
        frappe.db.set_value("User", doc_user.name, "role_profile_name", "Support Users")

    doc_user.reload()
    update_user(doc_user)

