// Copyright (c) 2023, Frappe Technologies and contributors
// For license information, please see license.tx

frappe.ui.form.on('Support EXP', {
	refresh: function(frm) {
		// if(!frm.doc.initialtion_datetime){
		// var dateTime = frappe.datetime.now_datetime();
		// frm.set_value('initialtion_datetime',dateTime);
		
		// }
		
		if (frm.is_new() && (frappe.user.has_role('Department HOD') || frappe.user.has_role('Support User'))) {
			if(!frm.doc.user){
				frappe.call({
					method:"frappe.support_application.doctype.support_exp.support_exp.get_user_details",
					callback: function(response) {
						var data = response.message;
						
						frm.set_value("user", data[0]);
						frm.set_value('project',data[1]);
						frm.save();

						

					}
				});
			}	
		}
	}
});

frappe.ui.form.on('Support EXP', {
	refresh: function(frm){
		if (frm.is_new() && frappe.user.has_role('Expedien HOD') ||frappe.user.has_role('On Site User') || (frappe.user.has_role('Project Coordinator')|| (frappe.user.has_role('Support Super User')))){
			if(!frm.doc.user){
				frappe.call({
					method:
						"frappe.support_application.doctype.support_exp.support_exp.get_manager_details",
					callback: function(response) {
						var data = response.message;
						
						frm.set_value("user", data);
						// frm.set_df_property("project", "read_only", 0);
						

						
						
						
						// frm.save();
						

					}
				});
			}
		}

		
		
		

	}
});
frappe.ui.form.on('Support EXP', {
	refresh: function(frm) {
		if(frappe.user.has_role('Support User')){
			frm.set_df_property("rejection_comments_hod", "read_only", 0);
			
			
			}
	}
});


//   frappe.ui.form.on("Support EXP", {
// 	refresh: function(frm) {
// 	  // Get the parent container of the HTML field
// 	  var container = $(frm.fields_dict.html_field.wrapper);
  
// 	  // Attach the click event listener using event delegation
// 	  container.on('click', '.your-custom-button', function() {
// 		// Retrieve the file ID from the data attribute
// 		var fileId = $(this).data('file-id');
  
// 		// Call the deleteAttachment function passing the file ID
// 		deleteAttachment(fileId);
// 	  });
// 	}
//   });

//setting redmine and developer field mandatory on workflow state accepted and approved
frappe.ui.form.on('Support EXP', {
	refresh: function(frm) {
		if(frm.doc.workflow_state == 'Submitted'){
			frm.set_df_property("onsite_user", "read_only", 1);
			
			
			
		}
	}
});

frappe.ui.form.on('Support EXP', {
    delete_draft: function(frm) {
        if(frm.doc.workflow_state == "Draft"){
            frappe.confirm('Are you sure you want to permanenetly delete?',
                () => {
                    // Action to perform if "Yes" is selected
                    console.log("User clicked 'Yes'. Proceeding with the action...");
                    frappe.call({
                        method: 'frappe.support_application.doctype.support_exp.support_exp.delete_draft_doc',
                        args: {
                            docname: frm.doc.name
                        },
                        callback: function(response) {
                            // Handle the response or perform additional actions
                            
                            //reroute to list view
                            frappe.set_route('List', 'Support EXP');
                        }
                    });
                    // Place your desired action here when the user selects "Yes."
                }, () => {
                    // Action to perform if "No" is selected
                    
                    frappe.msgprint("Document not deleted");
                });
        }
    }
});


			
			


//setting redmine and developer field mandatory on workflow state accepted and approved
frappe.ui.form.on('Support EXP', {
	refresh: function(frm) {
		if(frappe.user.has_role('Expedien HOD')){
			frm.set_df_property("project", "read_only", 0);
			frm.set_df_property("onsite_user", "read_only", 0);
			if(frm.doc.workflow_state == 'Submitted'||frm.doc.workflow_state == 'Approved' ){
				// frm.set_df_property("redmine_url", "reqd", 1);
				frm.set_df_property("task", "reqd", 1);
				frm.set_df_property("developer", "reqd", 1);
			}
			}
	}
});

frappe.ui.form.on('Support EXP', {
	rejection_comments_hod: function(frm) {
		if(frappe.user.has_role('Expedien HOD')){
			frm.set_df_property("project", "read_only", 0);
			frm.set_df_property("onsite_user", "read_only", 0);
			if(frm.doc.workflow_state == 'Submitted'||frm.doc.workflow_state == 'Approved' || frm.doc.workflow_state == 'Rejected (Manager)'|| frm.doc.workflow_state == 'Rejected'  ){
				// frm.set_df_property("redmine_url", "reqd", 0);
				frm.set_df_property("task", "reqd", 0);
				frm.set_df_property("developer", "reqd", 0);
			}
			}
	}
});

frappe.ui.form.on('Support EXP', {
	on_hold_remarks: function(frm) {
		if(frappe.user.has_role('Expedien HOD')){
			frm.set_df_property("project", "read_only", 0);
			frm.set_df_property("onsite_user", "read_only", 0);
			if(frm.doc.workflow_state == 'Submitted'||frm.doc.workflow_state == 'Approved' || frm.doc.workflow_state == 'On Hold (Manager)' ){
				// frm.set_df_property("redmine_url", "reqd", 0);
				frm.set_df_property("task", "reqd", 0);
				frm.set_df_property("developer", "reqd", 0);
			}
			}
	}
});


frappe.ui.form.on('Support EXP', {
	refresh: function(frm) {
		if(frappe.user.has_role('Department HOD')){
			
			frm.set_df_property("onsite_user", "read_only", 0);
			
			
			}
	}
});

frappe.ui.form.on('Support EXP', {
	refresh: function(frm) {
		if(frappe.user.has_role('On Site User')){
			
			frm.set_df_property("project", "read_only", 0);
			
			
		}
	}
});

frappe.ui.form.on('Support EXP', {
	refresh: function(frm) {
		if(frm.doc.workflow_state == 'Draft'){
			frm.set_df_property("module", "read_only", 0);
			
			
		}
	}
});



frappe.ui.form.on("Support EXP", {
	refresh: function(frm) {
		if (!frm.is_new()) {
			frm.set_df_property("module", "reqd", 1);
			frm.set_df_property("subject", "reqd", 1);
			frm.set_df_property("description", "reqd", 1);
            frm.set_df_property("priority", "reqd", 1);
		
		}          
    },	
});


frappe.ui.form.on("Support EXP", {
	refresh: function(frm) {
		if (frm.is_new() && (frappe.user.has_role('Department HOD')||frappe.user.has_role('Support User'))) {
			frm.save();
			
		
		}          
    },	
});

frappe.ui.form.on("Support EXP", {
    refresh: function(frm) {
        if ((frappe.user.has_role('Support Developer')) && !frm.doc.completed && frm.doc.workflow_state === 'In Progress') {
            frm.add_custom_button('Mark as Done', function() {
				frappe.call({
					method: "frappe.support_application.doctype.support_exp.support_exp.mark_complete_developer",
					args: {
						docname: frm.doc.name
					},
					callback: function(response) {
						if(response.exc) {
							// Handle the exception, maybe show a message to the user
							frappe.msgprint(__("There was an error marking the document as complete."));
						} else {
							// Handle the success, maybe show a message or refresh the form
							frappe.msgprint(__("Document marked as complete!"));
							// Optionally, if you're calling this from a form, you can refresh it:
							if (cur_frm) {
								cur_frm.reload_doc();
							}
						}
					}
				});
                
            });
        }
    }
});

frappe.ui.form.on("Support EXP", {
    refresh: function(frm) {
        if ((frappe.user.has_role('Support Developer')) && (frm.doc.workflow_state == 'Submitted' || frm.doc.workflow_state == 'Assigned Work')) {
            frm.add_custom_button('Mark as In Progress', function() {
				frappe.call({
					method: "frappe.support_application.doctype.support_exp.support_exp.mark_in_progress",
					args: {
						docname: frm.doc.name
					},
					callback: function(response) {
						if(response.exc) {
							// Handle the exception, maybe show a message to the user
							frappe.msgprint(__("There was an error marking the document as In Progress."));
						} else {
							// Handle the success, maybe show a message or refresh the form
							frappe.msgprint(__("Document marked as In Progress!"));
							// Optionally, if you're calling this from a form, you can refresh it:
							if (cur_frm) {
								cur_frm.reload_doc();
							}
						}
					}
				});
                
            });
        }
    }
});





frappe.ui.form.on("Support EXP", {
	refresh: function(frm) {
		if ((frm.doc.workflow_state === 'Approved' ||frm.doc.workflow_state === 'Close' || frm.doc.workflow_state === 'Submitted' ||frm.doc.workflow_state === 'In Progress' ||frm.doc.workflow_state === 'Completed' || frm.doc.workflow_state ==='Assigned Work') && ((frappe.user.has_role('Expedien HOD') || (frappe.user.has_role('Support Developer'))|| (frappe.user.has_role('Support Super User'))) || frappe.user.has_role('Administrator'))) {
            frm.set_df_property("developer_end_section", "hidden", 0);
			frm.set_intro('Please enter the details in Developer Section', '');
		}   
		else {
			frm.set_df_property("developer_end_section", "hidden", 1);
		}
        
    },
		
	
});

// frappe.ui.form.on("Support EXP", {
// 	refresh: function(frm) {
// 		frm.set_query("developer", () => {
// 			return {
// 				filters: {
// 					is_developer: 1
// 				}
// 			};
// 		});
		
//     },
		
	
// });

// frappe.ui.form.on("Support EXP", {
// 	refresh: function(frm) {
// 		if (frappe.user.has_role('Department HOD')){
// 			frm.set_query("onsite_user", () => {
// 				return {
// 					filters: {
// 						is_onsite: 1,
// 						project: frm.doc.project
// 					}
// 				};
// 			});
		
//     },
		
	
// });





frappe.ui.form.on("Support EXP", {
	refresh: function(frm) {
		if(frm.doc.project == 'KVASU'|| frm.doc.project == 'TNAU')
			frm.set_df_property("onsite_user", "hidden", 1);
		
		
    },
		
	
});

frappe.ui.form.on("Support EXP", {
    refresh: function(frm) {
		if(frappe.user.has_role('Expedien HOD')|| (frappe.user.has_role('Department HOD')) || (frappe.user.has_role('Project Coordinator')|| (frappe.user.has_role('Support Super User')))){
        frm.fields_dict["onsite_user"].get_query = function(doc, cdt, cdn) {
            return {
                query: "frappe.support_application.doctype.support_exp.support_exp.get_onsite_users",
                filters: {
					project:frm.doc.project
				}
            };
        };
		}
    }
});


frappe.ui.form.on("Support EXP", {
    refresh: function(frm) {
		if(frappe.user.has_role('Expedien HOD')){
			frm.fields_dict["project"].get_query = function(doc, cdt, cdn) {
				return {
					query: "frappe.support_application.doctype.support_exp.support_exp.get_project_manager",
					filters: {}
				};
			};
			frm.fields_dict["developer"].get_query = function(doc, cdt, cdn) {
				return {
					query: "frappe.support_application.doctype.support_exp.support_exp.get_developers",
					user: frm.doc.user
				};
			};
		}
		else if(frappe.user.has_role('On Site User')){
			frm.fields_dict["project"].get_query = function(doc, cdt, cdn) {
				return {
					query: "frappe.support_application.doctype.support_exp.support_exp.get_project_onsite",
					filters: {}
				};
			};
		} 


    }
});





frappe.ui.form.on('Support EXP', {
    onload: function(frm) {
        // Hide the menu button
        frm.page.wrapper.find('button.btn.icon-btn[data-toggle="dropdown"][aria-expanded="false"]').hide();
    }
});

frappe.ui.form.on('Support EXP', {
    refresh: function(frm) {
		// Listen for state change to "On Hold (Manager)"
        if (frm.doc.workflow_state === 'On Hold (Manager)' && !frm.doc.on_hold_remarks) {

			frappe.prompt([
                {
                    label: 'On-Hold Remarks',
                    fieldname: 'on_hold_remarks',
                    fieldtype: 'Small Text',
                    reqd: 1, // Make the remarks field mandatory
                }
            ], function(values) {
                if (!values.on_hold_remarks) {
                    frappe.msgprint('Remarks are mandatory.');
                    return;
                }
                // Save the remarks to the document
                frm.set_value('on_hold_remarks', values.on_hold_remarks);
                frm.save();
				
            }, 'On-Hold Remarks', 'Save');
        }
    }
});

frappe.ui.form.on('Support EXP', {
    refresh: function(frm) {
		// Listen for state change to "On Hold (Manager)"
        if ((frm.doc.workflow_state === 'Rejected (Manager)' || frm.doc.workflow_state === 'Rejected') && !frm.doc.rejection_comments_hod) {

			frappe.prompt([
                {
                    label: 'Rejection Remarks',
                    fieldname: 'rejection_comments_hod',
                    fieldtype: 'Small Text',
                    reqd: 1, // Make the remarks field mandatory
                }
            ], function(values) {
                if (!values.rejection_comments_hod) {
                    frappe.msgprint('Remarks are mandatory.');
                    return;
                }
                // Save the remarks to the document
                frm.set_value('rejection_comments_hod', values.rejection_comments_hod);
                frm.save();
				
            }, 'Rejection Remarks', 'Save');
        }
    }
});




// frappe.ui.form.on('Support EXP', {
//     refresh: function(frm) {
//         // Log meta properties of the frm object
//         for (var prop in frm) {
//             if (frm.hasOwnProperty(prop)) {
//                 console.log(`Meta Property: ${prop}`, frm[prop]);
//             }
//         }
//     }
// });




frappe.ui.form.on('Support EXP', {
    attach_file: function (frm) {
        if (frm.doc.__islocal || frm.doc.workflow_state == "Draft" || frm.doc.workflow_state == "Sent For Approval"|| frm.doc.workflow_state == "On Hold (Manager)") {
            if (frm.doc.__islocal) {
                frm.save().then(() => {
                    uploadFile(frm);
                });
            } else {
                uploadFile(frm);
            }
        } else {
            frappe.throw("Attachment not allowed");
        }
    }
});

function uploadFile(frm) {
    new frappe.ui.FileUploader({
        method: 'frappe.support_application.doctype.support_exp.support_exp.capture',
        make_attachments_public: "False",
        dialog_title: "Upload Files",
        disable_file_browser: "False",
        allow_link: "True",
        frm: frm,
        on_success(file) {
            frappe.show_alert({
                message: __('File uploaded.'),
                indicator: 'green'
            }, 5);

            frm.refresh();
        }
    });
}



frappe.ui.form.on('Support EXP', {
    completion_attachment: function (frm) {
        if (frappe.user.has_role('Expedien HOD') || frappe.user.has_role('On Site User')) {
            if (frm.doc.__islocal) {
                frm.save().then(() => {
                    uploadCompletionFile(frm);
                });
            } else {
                uploadCompletionFile(frm);
            }
        } else {
            frappe.throw("Attachment not allowed");
        }
    }
});

function uploadCompletionFile(frm) {
    new frappe.ui.FileUploader({
        method: 'frappe.support_application.doctype.support_exp.support_exp.capture_completion',
        make_attachments_public: "False",
        dialog_title: "Upload Files",
        disable_file_browser: "False",
        allow_link: "True",
        frm: frm,
        on_success(file) {
            frappe.show_alert({
                message: __('File uploaded.'),
                indicator: 'green'
            }, 5);

            frm.refresh();
        }
    });
}

frappe.ui.form.on('Support EXP', {
    planned_start_date: function(frm) {
        if (frm.doc.planned_start_date) {
            frm.set_value('actual_start_date', frm.doc.planned_start_date);
        }
    },
    planned_end_date: function(frm) {
        if (frm.doc.planned_end_date) {
            frm.set_value('actual_end_date', frm.doc.planned_end_date);
        }
    },
	estimated_hours: function(frm) {
        if (frm.doc.estimated_hours) {
            frm.set_value('actual_hours', frm.doc.estimated_hours);
        }
    }

});




frappe.ui.form.on("Support EXP", {
    project: function(frm) {
		
		frappe.call({
			method: "frappe.support_application.doctype.support_exp.support_exp.get_Modules",
			args: {
				project: frm.doc.project
				
			
			},
			callback: function(response) {
				var options = response.message;
				frm.set_df_property("module", "options", options);
				
				
		
				
			}
		});
      
    }
  });



frappe.ui.form.on("Support EXP", {

    refresh: function(frm) {
		if(frm.doc.project){
		
			frappe.call({
				method: "frappe.support_application.doctype.support_exp.support_exp.get_Modules",
				args: {
					project: frm.doc.project
				
				},
				callback: function(response) {
					var options = response.message;
					frm.set_df_property("module", "options", options);

					
					
			
					
				}
			});
		}
    }
  });


frappe.ui.form.on("Support EXP", {

    refresh: function(frm) {
		if(!frm.is_new() && (frappe.user.has_role('Department HOD')||frappe.user.has_role('Support User'))){
			frm.set_df_property("project", "read_only", 1);


		
		}
    }
  });

// 


  


frappe.ui.form.on('Support EXP', {
	refresh: function(frm) {
		if (!frm.is_new()) {
			frappe.call({
				method: 'frappe.support_application.doctype.support_exp.support_exp.get_attached_files',
				args: {
					docname: frm.doc.name,
				},
				callback: function(response) {
					var options_html = response.message;
					frm.fields_dict.attachments.df.options = options_html;
					frm.refresh_field('attachments');
					// frm.reload();
					// frappe.msgprint(options_html, "Attachments");

					// frappe.prompt([
					//     {
					//         fieldname: 'html_field',
					//         fieldtype: 'HTML',
					//         label: 'HTML Field',
					//         options: options_html,
					//         reqd: true
					//     }
					// ], function(values){
					//     // Handle the prompt values if needed
					// }, 'Attached Files');
				}
			});
		}
	}
});

frappe.ui.form.on('Support EXP', {
	refresh: function(frm) {
		if (frm.is_new()) {
			
			var options_html = null;
			frm.fields_dict.attachments.df.options = options_html;
			frm.refresh_field('attachments');
			
		}
	}

});

frappe.ui.form.on("Support EXP", {
    refresh: function(frm) {
        // Add your custom logic here
        
        // Find all delete buttons
        var deleteButtons = $(frm.wrapper).find('.delete-button');
        
        // Attach click event handler to each delete button
        deleteButtons.on('click', function() {
            var fileId = $(this).attr('data-file-id');
			console.log(fileId);
            
            if(frm.doc.workflow_state == "Draft" || frappe.user.has_role('Expedien HOD')){
				frappe.confirm('Are you sure you want to proceed?',
					() => {
						// Action to perform if "Yes" is selected
						console.log("User clicked 'Yes'. Proceeding with the action...");
						frappe.call({
							method: 'frappe.support_application.doctype.support_exp.support_exp.delete_file',
							args: {
								file_id: fileId
							},
							callback: function(response) {
								// Handle the response or perform additional actions
								
								frm.refresh();
		
							}
						});
						// Place your desired action here when the user selects "Yes."
					}, () => {
						// Action to perform if "No" is selected
						console.log("User clicked 'No'. Action canceled.");
						// Place your desired action here when the user selects "No."
					});
			}
            
				
		    
			else{
				frappe.throw("File deletion only allowed by owner in Draft");
			}
        });
    }
});



frappe.ui.form.on('Support EXP', {
	attached_files: function(frm) {
		if (!frm.is_new()) {
			frappe.call({
				method: 'frappe.support_application.doctype.support_exp.support_exp.get_attached_files',
				args: {
					docname: frm.doc.name,
				},
				callback: function(response) {
					var options_html = response.message;
					// frappe.msgprint(options_html);
					frm.fields_dict.attachments.df.options = options_html;
					frm.refresh_field('attachments');
					
					
					// frappe.msgprint(options_html, "Attachments");

					// frappe.prompt([
					//     {
					//         fieldname: 'html_field',
					//         fieldtype: 'HTML',
					//         label: 'HTML Field',
					//         options: options_html,
					//         reqd: true
					//     }
					// ], function(values){
					//     // Handle the prompt values if needed
					// }, 'Attached Files');
				}
			});
		}
	}
});

frappe.ui.form.on('Support EXP', {
    refresh: function(frm) { 
        if (frm.doc.docstatus === 0 && frm.doc.workflow_state == "Draft") {
            frm.add_custom_button(__('Save and Submit'), function() {
                // Convert the frm.doc object to JSON format
                var doc_json = JSON.stringify(frm.doc);
                
                console.log('doc_json:', doc_json);
                
                frappe.call({
                    method: 'frappe.support_application.doctype.support_exp.support_exp.accept_and_save',
                    args: {
                        doc_json: doc_json
                    },
                    callback: function(response) {
                        if (response.message) {
                            frappe.show_alert(__('Document saved and submitted.'));
                            frappe.set_route("Form", "Support EXP", response.message.name);
							
                        }
						
                    }
                });
            });
        }
    }
});

/////////////////================ROUGH CODE=================/////////////

// frappe.ui.form.on('Support EXP', {
//     before_submit: function(frm) {
//         showCommentsPrompt(frm);
//         // Return false to prevent the form from being submitted immediately
//         return false;
//     }
// });

// function showCommentsPrompt(frm) {
//     frappe.prompt([
//         {
//             fieldname: 'comments',
//             label: 'Comments',
//             fieldtype: 'Text',
//             reqd: 1
//         }
//     ], function(values) {
//         if (values.comments) {
//             frm.doc.rejection_comments_hod = values.comments;
//             frm.save();
//             frappe.show_alert('Support Ticket rejected.');
//             frm.refresh();
//         }
//     }, 'Reject', 'Reject');
// }




// frappe.ui.form.on('Support EXP', {
// 	refresh(frm) {
// 		$(".form-assignments").hide();
// 		// $(".form-attachments").hide();
// 		$(".form-shared").hide();
// 		$(".form-tags").hide();
// 		$(".form-sidebar-stats").hide();
		
		
// 		$(".list-unstyled.sidebar-menu.text-muted").hide();
	
		
// 	}
// });

// frappe.ui.form.on('Support EXP', {
// 	onload(frm) {
// 		$(".form-assignments").hide();
// 		// $(".form-attachments").hide();
// 		$(".form-shared").hide();
// 		$(".form-tags").hide();
// 		$(".form-sidebar-stats").hide();
		
		
// 		$(".list-unstyled.sidebar-menu.text-muted").hide();
	
		
// 	}
// });


// frappe.ui.form.on('YourDoctype', {
//     refresh: function(frm) {
//         // Add the "disable" class to ".layout-main-section-wrapper"
//         frappe.ui.set_style(`
//             .layout-main-section-wrapper {
//                 pointer-events: none !important;
//                 opacity: 0.5;
//             }
//         `);
//     }
// });
// frappe.ui.form.on('Support EXP', {
//     refresh: function(frm) {	// .page-title .sidebar-toggle-btn .sidebar-toggle-icon, .page-title .sidebar-toggle-btn .sidebar-toggle-placeholder {
			// 	display:none;
			// }
// });

	// .page-title .sidebar-toggle-btn .sidebar-toggle-icon, .page-title .sidebar-toggle-btn .sidebar-toggle-placeholder {
			// 	display:none;
			// }

// frappe.ui.form.on('Support EXP', {
// 	attach_file: function (frm) {
// 		if(frm.doc.workflow_state == "Draft"){
// 			new frappe.ui.FileUploader({
// 				method: 'frappe.support_application.doctype.support_exp.support_exp.capture',
		
// 				make_attachments_public: "False",
// 				dialog_title: "Upload Files",
// 				disable_file_browser: "False",
// 				frm: frm,
// 				// restrictions: {
// 				// allowed_file_types: [".png", ".pdf",".jpeg",".xlsx",".docx",".pptx"]

// 				// },
// 				on_success(file) {
// 				frappe.show_alert({
// 					message: __('File uploaded.'),
// 					indicator: 'green'
					
// 				}, 5);

// 				frm.refresh();
			
// 				}
		
// 			});
// 		}
// 		else{
// 			frappe.throw("Attachment only allowed in Draft")
// 		}

		
// 	}
// 	});

// frappe.ui.form.on("Support EXP", {
// 		refresh: function(frm) {
// 			frm.add_custom_button("Create Advance Request", () => {
// 				frappe.call({
// 					method: "frappe.support_application.doctype.support_exp.support_exp.add_docshare",
					
// 					callback: function(response) {
						
						
						
				
						
// 					}
// 				});
					
					
// 				});
// 			}
		
// 	});
	



// frappe.ui.form.on('Support EXP', {
// 	// validate: function(frm) {
// 	// 	var redmine_url_field = frm.fields_dict.redmine_url;
// 	// 	if (redmine_url_field.df.fieldtype === 'Data' && redmine_url_field.df.options !== 'Phone' && redmine_url_field.df.options !== 'Email') {
// 	// 		var value = redmine_url_field.get_value();
// 	// 		if (value && !/^\d{6}$/.test(value)) {
// 	// 			frappe.msgprint(__('Only 5-digit numeric input is allowed for field {0}', [redmine_url_field.df.label]));
// 	// 			redmine_url_field.set_value("");
// 	// 		}
// 	// 	}
// 	// },
	
// 	refresh: function(frm) {
// 		var redmine_url_field = frm.fields_dict.redmine_url;
// 		if (
// 			redmine_url_field.df.fieldtype === 'Data' &&
// 			redmine_url_field.df.options !== 'Phone' &&
// 			redmine_url_field.df.options !== 'Email'
// 		) {
// 			redmine_url_field.$input.on('input', function(event) {
// 				var inputValue = redmine_url_field.$input.val();
// 				var sanitizedValue = inputValue.slice(0, 6); // Limit to 6 characters
	
// 				redmine_url_field.$input.val(sanitizedValue);
// 			});
// 		}
// 	}
	
// });

// frappe.ui.form.on('Support EXP', {
//     refresh: function(frm) {

		// frappe.dom.set_style(`
		// 	.layout-main .layout-side-section {
		// 		display:none;
		// 	}
		
		// `);
// 		// frappe.ui.toolbar.toggle_full_width();
		
// 	}
	
// });

// frappe.ui.form.on('Support EXP', {
//     refresh: function(frm) {
//         // Set autofocus on the "subject" field
//         var subjectField = frm.fields_dict.subject.$input;
//         subjectField.focus();
//     }
// });