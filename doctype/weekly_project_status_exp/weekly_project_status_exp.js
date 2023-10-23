// Copyright (c) 2023, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Weekly Project Status EXP', {
    week_start_date: function(frm) {
        if (frm.doc.week_start_date) {
            var week_start_date = frappe.datetime.str_to_obj(frm.doc.week_start_date);
            var week_end_date = new Date(week_start_date);
            week_end_date.setDate(week_start_date.getDate() + 7);
            
            // Setting the week_end_date field
            frm.set_value('week_end_date', frappe.datetime.obj_to_str(week_end_date));
        }
    }
});

frappe.ui.form.on('Weekly Project Status EXP'),{
    refresh: function(frm){
        if (!frm.is_new()){
            frm.set_df_property("project","read_only",1);
            frm.set_df_property("week_start_date","read_only",1);

        }
    }

};

frappe.ui.form.on('Weekly Project Status EXP', {
    project: function(frm) {
        console.log("Project field changed");
        frm.save();
    }
});




frappe.ui.form.on('Weekly Project Status EXP', {
    refresh: function(frm) {
        
        if ((!frm.is_new()) && (!frm.doc.ticket_status_checker)) {
            frm.set_df_property("project", "read_only", 1);
            frm.set_df_property("week_start_date","read_only",1);
            frappe.call({
                method: "frappe.support_application.doctype.weekly_project_status_exp.weekly_project_status_exp.get_ticket_counts",
                args: {
                    week_start_date: frm.doc.week_start_date,
                    week_end_date: frm.doc.week_end_date,
                    project : frm.doc.project
                },
                callback: function(response) {
                    var data = response.message;
                    

                    if (!frm.doc.ticket_status_checker) {
                        // Convert the ticket counts to numbers and extract them
                        var low_priority_tickets = parseInt(data['Low']);
                        var medium_priority_tickets = parseInt(data['Medium']);
                        var high_priority_tickets = parseInt(data['High']);

                        frm.set_value('low_priority_tickets', low_priority_tickets);
                        frm.set_value('medium_priority_tickets', medium_priority_tickets);
                        frm.set_value('high_priority_tickets', high_priority_tickets);

                        

                        // Calculate the total
                        var total_tickets = parseInt(data['Submitted'])+parseInt(data['Approved'])+parseInt(data['In Progress'])+parseInt(data['Close'])+parseInt(data['Completed']);
                        frm.set_value('total_tickets', total_tickets);

                        var resolved_tickets = (parseInt(data['Close'])) + (parseInt(data['Completed']));
                        frm.set_value('resolved_tickets', resolved_tickets);

                        var pending_tickets = total_tickets - resolved_tickets;
                        frm.set_value('pending_tickets', pending_tickets);
                        frm.set_value("ticket_status_checker",1);

                        // Refresh the individual fields
                        frm.refresh_field('low_priority_tickets');
                        frm.refresh_field('medium_priority_tickets');
                        frm.refresh_field('high_priority_tickets');
                        frm.refresh_field('total_tickets');
                        frm.refresh_field('resolved_tickets');
                        frm.refresh_field('pending_tickets');
                    }
                },
                error: function(err) {
                    frappe.msgprint(__('Error fetching ticket counts. Please try again.'));
                }
            });
        }
    }
});





// 

//Completed Deliveries popup
frappe.ui.form.on('Weekly Project Status EXP', {
	add_completed_deliveries: function(frm) {
		frappe.call({
			method: "frappe.support_application.doctype.weekly_project_status_exp.weekly_project_status_exp.get_Modules",
            args:{
                project:frm.doc.project
            },
			callback: function(response) {
				var options = response.message;
				var fields = [
					{ 'fieldname': 'date', 'fieldtype': 'Date', 'label': 'Date', 'reqd': 1 },
					{ 'fieldname': 'module', 'fieldtype': 'Select', 'label': 'Module', 'reqd': 1, 'options': options },
					{ 'fieldname': 'description', 'fieldtype': 'Small Text', 'label': 'Description', 'reqd': 1 }
				];
				frappe.prompt(fields, function(values) {
					if (frappe.datetime.str_to_obj(values.date) < frappe.datetime.str_to_obj(frm.doc.week_start_date) || frappe.datetime.str_to_obj(values.date) > frappe.datetime.str_to_obj(frm.doc.week_end_date)) {
						frappe.throw('Should be in between the Week');
						return;
					}
					
					var row = frappe.model.add_child(frm.doc, 'Completed Deliveries EXP', 'cdt');
					row.date = values.date;
					row.module = values.module;
					row.description = values.description;
		
					frm.refresh_field('cdt');
				}, 'Add Deliveries');
			}
		});
	}
});


//Upcoming Deliveries popup
frappe.ui.form.on('Weekly Project Status EXP', {
	add_upcoming_deliveries: function(frm) {
		frappe.call({
			method: "frappe.support_application.doctype.weekly_project_status_exp.weekly_project_status_exp.get_Modules",
            args:{
                project:frm.doc.project
            },
			callback: function(response) {
				var options = response.message;
				var fields = [
					{ 'fieldname': 'date', 'fieldtype': 'Date', 'label': 'Date' },
					{ 'fieldname': 'module', 'fieldtype': 'Select', 'label': 'Module', 'reqd': 1,'options':options },
					{ 'fieldname': 'description', 'fieldtype': 'Small Text', 'label': 'Description', 'reqd': 1 }
					];
				frappe.prompt(fields, function(values) {
					
					var row = frappe.model.add_child(frm.doc, 'Upcoming Deliveries EXP', 'udt');
					row.date = values.date;
					row.module = values.module;
					row.description = values.description;
		
					frm.refresh_field('udt');
					}, 'Add Deliveries');

				
			}
		});
		
			
		
	  }
	});
    // frappe.ui.form.on('Weekly Project Status EXP', {
    //     refresh: function(frm) {
    //         frm.add_custom_button('Weekly Summary', function() {
    //             const week_start_date = frm.doc.week_start_date;
    //             const week_end_date = frm.doc.week_end_date;
    //             const project_form = frm.doc.project;
    
    //             if(!week_start_date || !week_end_date || !project_form) {
    //                 frappe.msgprint(__('Please ensure Week Start Date, Week End Date and Project Name are filled.'));
    //                 return;
    //             }
    
    //             const href_link = `/app/weekly-summary-repor?date_range=${week_start_date},${week_end_date}&project=${project_form}`;
    //             window.location.href = href_link;
    //         }, __("Action"));
    //     }
    // });
    

    frappe.ui.form.on('Weekly Project Status EXP', {
        refresh: function(frm) {
            if(frappe.user.has_role('On Site User')){
                frm.fields_dict["project"].get_query = function(doc, cdt, cdn) {
                    return {
                        query: "frappe.support_application.doctype.support_exp.support_exp.get_project_onsite",
                        filters: {}
                    };
                };
            } 
            
        }
    });
    
			
	  
frappe.ui.form.on('Weekly Project Status EXP', {
    refresh: function(frm) {
        render_field_as_link(frm, 'resolved_tickets', function() {
            // Action for resolved_tickets click
            show_completed_ticket_status(frm);
        });
        
        render_field_as_link(frm, 'pending_tickets', function() {
            // Action for pending_tickets click
            show_pending_ticket_status(frm);
        });
    }
});

function render_field_as_link(frm, fieldname, clickAction) {
    var field = frm.get_field(fieldname);
    if (field) {
        var valueElement = field.$wrapper.find('.control-value');
        var value = frm.doc[fieldname];
        if (value && valueElement.length) {
            valueElement.html(`<a href="#" style="text-decoration: underline;">${value}</a>`);
            valueElement.find('a').click(function(e) {
                e.preventDefault(); // To prevent any default action
                clickAction(); // Execute the desired action
            });
        }
    }
}

function show_completed_ticket_status(frm) {
    frappe.call({
        method: "frappe.support_application.doctype.weekly_project_status_exp.weekly_project_status_exp.get_completed_tickets_count",
        args: {
            start_date: frm.doc.week_start_date,
            end_date: frm.doc.week_end_date,
            project: frm.doc.project
        },
        callback: function(response) {
            var options_html = response.message;

            // Defining the button action
            var primary_action_label = "View Resolved Tickets";
            var primary_action = function() {
                frappe.set_route('List', 'Support EXP', {
                    'initialtion_datetime': ['between', [frm.doc.week_start_date, frm.doc.week_end_date]],
                    'project': frm.doc.project,
                    'workflow_state': ['in', ['Close', 'Completed']]
                });
            };
            

            frappe.prompt({
                fieldname: 'html_field',
                fieldtype: 'HTML',
                label: 'HTML Field',
                options: options_html
            },
            primary_action,
            "Resolved Tickets",
            primary_action_label
            );
        }
    });
}

function show_pending_ticket_status(frm) {
    frappe.call({
        method: "frappe.support_application.doctype.weekly_project_status_exp.weekly_project_status_exp.get_pending_tickets_count",
        args: {
            start_date: frm.doc.week_start_date,
            end_date: frm.doc.week_end_date,
            project: frm.doc.project
        },
        callback: function(response) {
            var options_html = response.message;

            // Defining the button action
            var primary_action_label = "View Pending Tickets";
            var primary_action = function() {
                frappe.set_route('List', 'Support EXP', {
                    'initialtion_datetime': ['between', [frm.doc.week_start_date, frm.doc.week_end_date]],
                    'project': frm.doc.project,
                    'workflow_state': ['in', ['Submitted', 'Approved', 'In Progress']]
                });
            };

            frappe.prompt({
                fieldname: 'html_field',
                fieldtype: 'HTML',
                label: 'HTML Field',
                options: options_html
            },
            primary_action,
            "Pending Tickets",
            primary_action_label
            );
        }
    });
}
