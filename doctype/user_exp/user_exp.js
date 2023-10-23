// Copyright (c) 2023, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('User EXP', {
	is_manager: function(frm) {
		if(frm.doc.is_manager == 1){
			frm.set_df_property("project", "hidden", 1);
			frm.set_value("project", "");
			frm.set_df_property("developer", "hidden", 0);
			
		}

	}
});

// frappe.ui.form.on('User EXP', {
// 	is_onsite: function(frm) {
// 		if(frm.doc.is_onsite){
// 			frm.set_df_property("project", "hidden", 1);
// 			frm.set_value("project", "");
// 		}

// 	}
// });

frappe.ui.form.on('User EXP', {
	is_developer: function(frm) {
		if(frm.doc.is_developer){
			frm.set_df_property("project", "hidden", 1);
			frm.set_value("project", "");
		}

	}
});



frappe.ui.form.on('User EXP', {
	refresh: function(frm) {
		if(frm.doc.is_developer || frm.doc.is_manager){
			frm.set_df_property("project", "hidden", 1);
			
			frm.set_value("project", "");
		}
		else{
			frm.set_df_property("project", "hidden", 0);
		}

	}
});


frappe.ui.form.on('User EXP',{
	refresh:function(frm){
		frm.add_custom_button("Create Developer User", () => {
			frappe.call({
				method: "frappe.support_application.doctype.user_exp.user_exp.make_user",
				args:{
					user_fname:frm.doc.name1,
					user_mobile:frm.doc.mobile_number,
					user_email:frm.doc.email_address,
					
					user_lname:0,
					user_mobile:'',
					user_isManager:0,
					user_is_department_head:0,
					user_is_onsite:0,
					user_is_coordinator:0,
					user_is_dev:1





				},
				callback: function(response) {
					
					
					
			
					
				}
			});
				
				
			});
		
	}
})


