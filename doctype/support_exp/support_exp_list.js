//Applying filter on users to see only thier specific project in listview filter

frappe.listview_settings['Support EXP'] = {
    onload: function(listview) {
        // var project_name_user;
		// if(frappe.user.has_role('Support User')||frappe.user.has_role('On Site User')||frappe.user.has_role('Department HOD')){
		// 	frappe.call({
		// 		method: 'frappe.support_application.doctype.support_exp.support_exp.get_user_details',
		// 		callback: function(response) {
		// 			var data = response.message;
		// 			project_name_user = data[1];
			
					

					
		// 		}
		// 	})
			// Modify the list view query to filter documents where the 'approver' field is set to 'EXEMP-0034/Anand'
			// listview.page.fields_dict['project'].get_query = function() {
			// 	return {
			// 		filters: {
			// 			project_name: project_name_user
			// 		}
			// 	};
				
			// };

			// if(frappe.user.has_role('Expedien HOD')){
			// 	listview.page.fields_dict['project'].get_query = function() {
			// 		return {
			// 			query: "frappe.support_application.doctype.support_exp.support_exp.get_project_manager",
			// 			filters: {}
			// 		};
			// 	};
			// }
		if(frappe.user.has_role('On Site User')){
			listview.page.fields_dict['project'].get_query = function() {
				return {
					query: "frappe.support_application.doctype.support_exp.support_exp.get_project_onsite",
					filters: {}
				};
			};
		}
		if(frappe.user.has_role('Expedien HOD')){
			listview.page.fields_dict['project'].get_query = function() {
				return {
					query: "frappe.support_application.doctype.support_exp.support_exp.get_project_manager",
					filters: {}
				};
		 	};

		}

		// if(frappe.user.has_role('Support User')||frappe.user.has_role('Department HOD'){
		frappe.dom.set_style(`
			.result .list-subject {
				flex: 1.5; 
			}
			.result .list-row-col:nth-child(3) {
				text-align:center;
			}
			.result .list-row-col:nth-child(4) {
				flex: 1.2;
				text-align:center;
			}
			.result .list-row-col:nth-child(5) {
				flex: 1.2; 
				text-align: center;
			} 
			.result .list-row-col:nth-child(6) {
				flex: 3; 
			}
			.result .list-row-col:nth-child(7) {
				display:none;
			}
			.indicator-pill.gray {width:100%;}

			/*list row hover effect css*/

			.list-row:hover:not(.list-row-head), 
			.list-row-head:hover:not(.list-row-head) {
				background-color: #f1f3f9
			}
			

	
		`);

		var nameFilterField = $('.form-group[data-fieldname="name"] input');
		nameFilterField.focus();

		// listview.page.wrapper.find('button.btn.btn-primary.btn-sm').hide();
		
		
		// Refresh the list view to apply the modified query and show the filtered list
		listview.refresh();

}};


// frappe.listview_settings['Support EXP'] = {
//     // Columns to fetch but not display
//     query_fields: ['priority', 'developer', 'initialtion_datetime', 'workflow_state','completed'],

//     // Only 50 rows will be displayed per page
//     // page_length: 50,

//     set_row_background: function (row) {
//         // Get the current date
//         var currentDate = new Date();

//         // Calculate the difference in days between current date and initiation_datetime
//         var initialDate = new Date(row.initialtion_datetime);
//         var timeDifference = (currentDate - initialDate) / (1000 * 60 * 60 * 24);

//         // Check for the first condition

// 		if (
// 			(row.developer && (row.completed == 1)) &&
// 			(row.workflow_state == 'Submitted' || row.workflow_state == 'In Progress')
// 		  ) {
// 			return 'success';
// 		}
		
//         if (
//             row.workflow_state === 'Submitted' &&
//             !row.developer
//         ) {
//             if (row.priority === 'High' && timeDifference >= 3) {
//                 return 'danger';
//             }
//             if (row.priority === 'Medium' && timeDifference >= 5) {
//                 return 'danger';
//             }
//             if (row.priority === 'Low' && timeDifference >= 7) {
//                 return 'danger';
//             }

//         }

//         // Check for the second condition
        
//     },
// };
