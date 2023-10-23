let columns
let rows

frappe.pages['datatable'].on_page_load = function(wrapper) {
    const page = makePage(wrapper);
    const datatable_container = $('<div></div>').appendTo(page.main);
	applyCustomCSS();
    fetchDistinctProjects();
    bindFieldEvents();

	const xlsxScript = document.createElement("script");
    xlsxScript.type = "text/javascript";
    xlsxScript.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.16.9/xlsx.full.min.js";
    document.body.appendChild(xlsxScript);
	

    // page.set_primary_action('Go to Support EXP', setPrimaryAction);
    page.set_primary_action("Go to Support EXP", function() {
		frappe.route_options = getFilteredValues();
        frappe.set_route('List', 'Support EXP');
		}, "fa fa-download"); // You can replace "fa fa-download" with an appropriate icon class if needed.
					;

    render_datatable();

    function makePage(wrapper) {
		const page = frappe.ui.make_app_page({
			parent: wrapper,
			title: 'Support Report Table',
			single_column: true
		});

		let projectsField = page.add_field({
			label: "Projects",
			fieldtype: 'Select',
			fieldname: 'projects',
			options: []
		});
	
		let moduleField = page.add_field({
			label: "Module",
			fieldtype: 'Select',
			fieldname: 'module',
			options: []
		});
		// let workflowStateField = page.add_field({
		// 	label: "Status",
		// 	fieldtype: 'Select',
		// 	fieldname: 'status',
		// 	options: ['Submitted','Completed','In Progress']
			
		// });

		let dateRangeField = page.add_field({
			label: "Date Range",
			fieldtype: 'DateRange',
			fieldname: 'date_range'
		});

		

		
	
		
	
		// "Clear Filter" button definition
		let clearFilterButton = page.add_field({
			label: "Clear Filter",
			fieldtype: 'Button',
			fieldname: 'clear_filter',
			click: function() {
				// Clear the input values
				dateRangeField.set_value(null);
				moduleField.set_value(null);
				// projectsField.set_value(null);
				// workflowStateField.set_value(null);
	
				// Re-render the datatable without filters
				render_datatable();
			}
		});
		let exportButton = page.add_field({
			label: "Export To CSV",
			fieldtype: 'Button',
			fieldname: 'export_button',
			click: function() {
				exportToExcel(columns,rows)
				
			}
		});

		let ageDays = page.add_field({
			label: "Aging Report Days",
			fieldtype: 'Int',
			fieldname: 'age_days',
			
		});

		let agingReportButton = page.add_field({
			label: "Aging Report",
			fieldtype: 'Button',
			fieldname: 'aging_report_button',
			click: function() {
				
				render_aging_report();
			}
		});
		
		// function workflow_status() {
		// 	// Get the selected value
		// 	var selectedValue = workflowStateField.get_value();
	
		// 	var targetInput = document.querySelector("#page-datatable > div.container.page-body > div.page-wrapper > div > div.row.layout-main > div > div.layout-main-section > div:nth-child(2) > div > div.dt-header > div > div.dt-row.dt-row-filter > div.dt-cell.dt-cell--col-6.dt-cell--filter > div > input");
	
		// 	if (targetInput) {
		// 		frappe.msgprint(selectedValue);
		// 		// Check if the element exists to avoid potential errors
		// 		targetInput.value = selectedValue;
		// 	}
		
			
		// };

	
		return page;
	}
	

	function render_aging_report() {
		var ageDays_report = page.fields_dict.age_days.get_value();
		frappe.call({
			method: 'frappe.support_application.doctype.support_exp.support_exp.get_support_exp_data',
			args: {
				ageDays : ageDays_report,
				aging_report: true
			},
			callback: renderTable // reuse the existing function to render the datatable
		});
	}



	
	
	
	


    function getFilteredValues() {
        const dateRange = page.fields_dict.date_range.get_value() || [null, null];
        return {
            project: page.fields_dict.projects.get_value(),
            module: page.fields_dict.module.get_value(),
			// status:page.fields_dict.status.get_value(),
            from_date: dateRange[0],
            to_date: dateRange[1]
			
        };
    }

    function setPrimaryAction() {
        frappe.route_options = getFilteredValues();
        frappe.set_route('List', 'Support EXP');
    }

    function fetchDistinctProjects() {
		
		if(frappe.user.has_role('Project Coordinator')){
			frappe.call({
				method: 'frappe.support_application.doctype.support_exp.support_exp.get_user_details',
				callback: function(response) {
					var data = response.message;
					project_name_user= data[1];
					
					
					page.fields_dict.projects.df.options = [' ',project_name_user];
					page.fields_dict.projects.refresh();
			
					

					
				}
			})
		}
		else{
			frappe.call({
				method: 'frappe.support_application.page.project_status.support_dashboard.get_distinct_projects',
				callback: function(response) {
					page.fields_dict.projects.df.options = response.message;
					page.fields_dict.projects.refresh();
				}
			});
		}
		

    }

	function applyCustomCSS() {
		const style = document.createElement('style');
		style.innerHTML = `
			.page-form {
				margin-bottom: 12px !important;
			}
		`;
		document.head.appendChild(style);
	}

    function fetchDistinctModules(selectedProject) {
		if (frappe.user.has_role('Expedien HOD')){
        frappe.call({
            method: 'frappe.support_application.page.project_status.support_dashboard.get_distinct_modules',
            args: { project: selectedProject },
            callback: function(response) {
                if (response && response.message) {
                    page.fields_dict.module.df.options = response.message;
                    page.fields_dict.module.refresh();
                } else {
                    console.error('Failed to fetch distinct modules.');
                }
            }
        });
    }
	else {
		frappe.call({
			method: "frappe.support_application.doctype.support_exp.support_exp.get_Modules",
			args: {
				project: selectedProject
				
			
			},
			callback: function(response) {
				if (response && response.message) {

                    page.fields_dict.module.df.options = response.message;
                    page.fields_dict.module.refresh();

					
                } else {
                    console.error('Failed to fetch distinct modules.');
                }
				
			}
		});

	}
}

    function bindFieldEvents() {
        page.fields_dict.date_range.$input.on('change', render_datatable);
        page.fields_dict.module.$input.on('change', render_datatable);
		// page.fields_dict.status.$input.on('change', render_datatable);
        page.fields_dict.projects.$input.on('change', function() {
            fetchDistinctModules(page.fields_dict.projects.get_value());
            render_datatable();
        });
    }

    function render_datatable() {
        const filters = getFilteredValues();
        frappe.call({
            method: 'frappe.support_application.doctype.support_exp.support_exp.get_support_exp_data',
            args: filters,
            callback: renderTable
        });
    }

    function renderTable(response) {
		columns = [
			// { name: 'Action', id: 'action' },
			// { name: 'Sno', id: 'sequence' },
			{ name: 'Ticket ID', id: 'ticket_id' },
			{ name: 'Created By', id: 'user' },
			{ name: 'Creation Datetime', id: 'initialtion_datetime' },
			{ name: 'Completion Date', id: 'actual_end_date' },
			
			{ name: 'Project', id: 'project' },
			{ name: 'Task', id: 'task' },
			{ name: 'Redmine URL', id: 'redmine_url' },
			{ name: 'Status', id: 'workflow_state' },
			{ name: 'Module', id: 'module' },
			{ name: 'Priority', id: 'priority' },
			{ name: 'Developer', id: 'developer' },
			{ name: 'Subject', id: 'subject' },
			{ name: 'Description', id: 'description' },
			{ name: 'Planned Start Date', id: 'planned_start_date' },
			{ name: 'Estimated Hours', id: 'estimated_hours' },
			{ name: 'Actual Hours', id: 'actual_hours' }
		];

		applyDatatableStyles(datatable_container);

		rows = response.message.map(item => [
			// '<button class="btn btn-primary route-btn" data-id="' + item.name + '">View</button>',
			// item.sequence,
			// item.ticket_id,
		    `<a href="support-exp/${item.name}" class="route-link">${item.ticket_id}</a>`,
			item.user,
			item.initialtion_datetime,
			item.actual_end_date,
			item.project,
			item.task,
			item.redmine_url,
			item.workflow_state,
			item.module,
			item.priority,
			item.developer,
			item.subject,
			item.description,
			item.planned_start_date,
			item.estimated_hours,
			item.actual_hours
		]);

		datatable = new DataTable(datatable_container[0], {
			columns: columns,
			data: rows,
			serialNoColumn: true,
			inlineFilters: true,
			dynamicRowHeight: true,


		});
	
		datatable.style.setStyle('.dt-cell--col-0', { backgroundColor: '#f0f0f0' });
	
		datatable_container.on('click', '.route-btn', function() {
			const name = $(this).data('id');
			frappe.set_route('Form', 'Support EXP', name);
		});


		
		
        
    }

	
	
	function exportToExcel(columns, rows) {
		// Convert data to CSV using the custom function
		var csv = convertToCSV(columns, rows);
	
		// Trigger download
		var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		var link = document.createElement("a");
		var url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", `${'Supportify_Export-'+frappe.datetime.nowdate()}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
	
	
	
	function convertToCSV(columns, rows) {
		// Convert column headers
		var csv = columns.map(col => `"${col.name}"`).join(",") + "\n";
		
		// Add separator row for all columns
		csv += columns.map(col => "########################").join(",") + "\n";
		
		// Convert rows
		csv += rows.map(row => {
			return row.map(cell => {
				// Check for null values
				if (cell === null || cell === undefined) {
					return '""';  // Return empty string for null values
				}
				
				// If cell is the one with the HTML link, extract the text
				if (typeof cell === 'string' && cell.includes("<a href=")){
					cell = extractTextFromHTML(cell);
				}
	
				// Escape double quotes in cell content
				return `"${cell.toString().replace(/"/g, '""')}"`;
			}).join(",");
		}).join("\n");
	
		return csv;
	}
	
	

	function extractTextFromHTML(htmlString) {
		var div = document.createElement("div");
		div.innerHTML = htmlString;
		return div.textContent || div.innerText || "";
	}
		
	function applyDatatableStyles(container) {
		// Existing styles
		$(container).find('.datatable-header-cell').css('background-color', '#f5f5f5');
		$(container).find('.datatable-row:nth-child(even)').css('background-color', '#f9f9f9');
		$(container).find('.datatable-row:nth-child(odd)').css('background-color', '#fff');
		
		// Wrap text
		$(container).find('.datatable-cell').css({
			'white-space': 'normal',
			'word-break': 'break-word'
		});
		$(container).find('.route-link').css({
			'color': 'inherit',
			'text-decoration': 'none'
		});
	}
	


}















//////////////////////////////////////////////////////////


// function exportToExcelXLSX(columns, rows) {
	// 	var worksheet = XLSX.utils.json_to_sheet(rows, { header: columns });
	// 	var workbook = XLSX.utils.book_new();
	// 	XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
	
	// 	var blob = workbook2blob(workbook);
	
	// 	var link = document.createElement("a");
	// 	var url = URL.createObjectURL(blob);
	// 	link.setAttribute("href", url);
	// 	link.setAttribute("download", `Supportify_Export_${frappe.datetime.nowdate()}.xlsx`);
	// 	link.style.visibility = "hidden";
	// 	document.body.appendChild(link);
	// 	link.click();
	// 	document.body.removeChild(link);
	// }
	
	// function workbook2blob(workbook) {
	// 	var wopts = {
	// 		bookType: 'xlsx',
	// 		bookSST: false,
	// 		type: 'binary'
	// 	};
	// 	var wbout = XLSX.write(workbook, wopts);
	
	// 	function s2ab(s) {
	// 		var buf = new ArrayBuffer(s.length);
	// 		var view = new Uint8Array(buf);
	// 		for (var i = 0; i < s.length; i++) {
	// 			view[i] = s.charCodeAt(i) & 0xFF;
	// 		}
	// 		return buf;
	// 	}
	
	// 	return new Blob([s2ab(wbout)], { type: "application/octet-stream" });
	// }
	

	
	

	// function convertToCSV(columns, rows) {
	// 	// Exclude the first column (Action) when mapping columns and add ID to make headers bold
	// 	let csv = columns.slice(1).map(col => `"${col.name}"`).join(",") + "\n";
		
	// 	// Add a bottom border by adding a line of equal signs ('======') under the headers
	// 	csv += columns.slice(1).map(() => "======").join(",") + "\n";
	
	// 	csv += rows.map(row => {
	// 		// Exclude the first cell (Action) from each row
	// 		return row.slice(1).map(cell => {
	// 			if (cell === null || cell === undefined) {
	// 				return '""';
	// 			}
	// 			return `"${cell.toString().replace(/"/g, '""')}"`;
	// 		}).join(",");
	// 	}).join("\n");
	
	// 	return csv;
	// }
	// function convertToCSV(columns, rows) {
	// 		// Convert column headers
	// 		var csv = columns.map(col => `"${col.name}"`).join(",") + "\n";
		
	// 		// Convert rows
	// 		csv += rows.map(row => {
	// 			return row.map(cell => {
	// 				// Check for null values
	// 				if (cell === null || cell === undefined) {
	// 					return '""';  // Return empty string for null values
	// 				}
					
	// 				// Escape double quotes in cell content
	// 				return `"${cell.toString().replace(/"/g, '""')}"`;
	// 			}).join(",");
	// 		}).join("\n");
		
	// 		return csv;
	// 	}
// frappe.pages['datatable'].on_page_load = function(wrapper) {
//     var page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Data Table',
//         single_column: true
//     });

// 		// Define the columns
// 	var columns = [
// 		{ name: 'Action', id: 'action' },
// 		// { name: 'Sno', id: 'sequence' },
// 		{ name: 'Name', id: 'ticket_id' },
// 		{ name: 'Project', id: 'project' },
// 		{ name: 'Task', id: 'task' },
// 		{ name: 'Redmine ID', id: 'redmine_url' },
// 		{ name: 'Status', id: 'workflow_state' },
// 		{ name: 'Module', id: 'module' },
// 		{ name: 'Priority', id: 'priority' },
// 		{ name: 'Developer', id: 'developer' },
// 		{ name: 'Subject', id: 'subject' },
// 		{ name: 'Description', id: 'description' },
// 		{ name: 'Planned Start Date', id: 'planned_start_date' },
// 		{ name: 'Estimated Hours', id: 'estimated_hours' },
// 		{ name: 'Actual Hours', id: 'actual_hours' }
// 	];

//     // Fields definition
//     // let startField = page.add_field({
//     //     label: "Start Date",
//     //     fieldtype: 'Date',
//     //     fieldname: 'start_date'
//     // });

//     // let endField = page.add_field({
//     //     label: "End Date",
//     //     fieldtype: 'Date',
//     //     fieldname: 'end_date'
//     // });

// 	let dateRangeField = page.add_field({
//         label: "Date Range",
//         fieldtype: 'DateRange',   // Using the DateRange field type provided by Frappe
//         fieldname: 'date_range'
//     });

//     let moduleField = page.add_field({
//         label: "Module",
//         fieldtype: 'Select',
//         fieldname: 'module',
//         options: []
//     });

//     let projectsField = page.add_field({
//         label: "Projects",
//         fieldtype: 'Select',
//         fieldname: 'projects',
//         options: [],
//         change() {
// 			fetchDistinctModules(projectsField.get_value())
            
//         }
//     });

// 	var datatable_container = $('<div></div>').appendTo(page.main);


//     // Fetch distinct projects and modules
//     frappe.call({
// 		method: 'frappe.support_application.page.project_status.support_dashboard.get_distinct_projects',
//         callback: function(response) {
//             projectsField.df.options = response.message;
//             projectsField.refresh();
//         }
//     });


// 	function fetchDistinctModules(selectedProject) {
//         frappe.call({
//             method: 'frappe.support_application.page.project_status.support_dashboard.get_distinct_modules',
//             args: {
//                 project: selectedProject
//             },
//             callback: function(response) {
//                 if (response && response.message) {
                    
//                     moduleField.df.options = response.message;
//                     moduleField.refresh();
//                 } else {
//                     console.error('Failed to fetch distinct modules.');
//                 }
//             }
//         });
//     }

    
//     page.set_primary_action('Go to Support EXP', function() {
// 		let dateRange = dateRangeField.get_value();
// 		if (dateRange) {
// 			startDate = dateRange[0];
// 			endDate = dateRange[1];
// 		} else {
// 			startDate = null; // or some default value
// 			endDate = null; // or some default value
// 		}

//         var filters = {
//             initialtion_datetime: ["between", [startDate, endDate]],
//             module: moduleField.get_value(),
//             project: projectsField.get_value()
//         };

//         frappe.route_options = filters;
//         frappe.set_route('List', 'Support EXP');
//     });

//     // Function to render datatable
//     function render_datatable() {
// 		let dateRange = dateRangeField.get_value();
// 		if (dateRange) {
// 			startDate = dateRange[0];
// 			endDate = dateRange[1];
// 		} else {
// 			startDate = null; // or some default value
// 			endDate = null; // or some default value
// 		}

//         frappe.call({
//             method: 'frappe.support_application.doctype.support_exp.support_exp.get_support_exp_data',
//             args: {
//                 project: projectsField.get_value(),
//                 module: moduleField.get_value(),
//                 from_date: startDate,
// 				to_date : endDate
//             },
//             callback: function(response) {
//                 // Your existing logic to render datatable goes here...
// 				// Prepare the data for the DataTable
// 			var rows = response.message.map(item => [
// 				'<button class="btn btn-primary route-btn" data-id="' + item.name + '">View</button>',
// 				// item.sequence,
// 				item.ticket_id,
// 				item.project,
// 				item.task,
// 				item.redmine_url,
// 				item.workflow_state,
// 				item.module,
// 				item.priority,
// 				item.developer,
// 				item.subject,
// 				item.description,
// 				item.planned_start_date,
// 				item.estimated_hours,
// 				item.actual_hours
// 			]);

// 			// Initialize the DataTable
// 			const datatable = new DataTable(datatable_container[0], {
// 				columns: columns,
// 				data: rows,
// 				// inlineFilters: true,
// 				serialNoColumn:false

// 			});
// 			console.log(datatable.datamanager);

// 			datatable.style.setStyle('.dt-cell--col-1', { backgroundColor: '#f0f0f0' });
			

// 			function convertToCSV(columns, rows) {
// 				// Convert column headers
// 				var csv = columns.map(col => `"${col.name}"`).join(",") + "\n";
			
// 				// Convert rows
// 				csv += rows.map(row => {
// 					return row.map(cell => {
// 						// Check for null values
// 						if (cell === null || cell === undefined) {
// 							return '""';  // Return empty string for null values
// 						}
						
// 						// Escape double quotes in cell content
// 						return `"${cell.toString().replace(/"/g, '""')}"`;
// 					}).join(",");
// 				}).join("\n");
			
// 				return csv;
// 			}

// 			page.set_secondary_action("Export to Excel", function() {
// 				// Convert data to CSV using the custom function
// 				var csv = convertToCSV(columns, rows);
				
// 				// Trigger download
// 				var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
// 				var link = document.createElement("a");
// 				var url = URL.createObjectURL(blob);
// 				link.setAttribute("href", url);
// 				link.setAttribute("download", "export.csv");
// 				link.style.visibility = 'hidden';
// 				document.body.appendChild(link);
// 				link.click();
// 				document.body.removeChild(link);
// 			}, "fa fa-download"); // You can replace "fa fa-download" with an appropriate icon class if needed.
			
			
		
			
			

// 			datatable_container.on('click', '.route-btn', function() {
//                 var name = $(this).data('id');
//                 frappe.set_route('Form', 'Support EXP', name); 
//             });
//             }
//         });
//     }

//     // Event listeners for fields to refresh datatable
// 	dateRangeField.$input.on('change', render_datatable);

//     moduleField.$input.on('change', render_datatable);
//     projectsField.$input.on('change', render_datatable);

//     // Initial render of datatable when page loads
//     render_datatable();
// }

// frappe.pages['datatable'].on_page_load = function(wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Data Table',
// 		single_column: true
// 	});

// 	$(wrapper).find('.layout-main-section-wrapper').css('height', '100vh');

// 	// Define the columns
// 	var columns = [
// 		{ name: 'S.No.', id: 'sno', width: 60 },
// 		{ name: 'Name', id: 'name' },
// 		{ name: 'Project', id: 'project' },
// 		{ name: 'Module', id: 'module' },
// 		{ name: 'Subject', id: 'subject' }
// 	];

// 	// Function to load data
// 	var loadData = function() {
// 		frappe.call({
// 			method: 'frappe.support_application.doctype.support_exp.support_exp.get_support_exp_data', // Replace with the actual path to your method
// 			callback: function(response) {
// 				// Prepare the data for the DataTable
// 				var rows = response.message.map((item, index) => [index + 1, item.name, item.project, item.module, item.subject]);

// 				// Initialize the DataTable
// 				const datatable = new DataTable(wrapper, {
// 					columns: columns,
// 					data: rows,
// 					inlineFilters: true
// 				});
// 				datatable.style.setStyle('.dt-cell--col-1', { backgroundColor: '#f0f0f0' });

// 				// Attach filter change event
// 				datatable.on('filter', function() {
// 					loadData(); // Reload the data when a filter is applied
// 				});
// 			}
// 		});
// 	};

// 	loadData(); // Load the data initially
// }


// frappe.pages['datatable'].on_page_load = function(wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Data Table',
// 		single_column: true
// 	});

// 	$(wrapper).find('.layout-main-section-wrapper').css('height', '100vh');

// 	// Define the columns
// 	var columns = [
// 		{ name: 'S.No.', id: 'sno', width: 60 },
// 		{ name: 'Name', id: 'name' },
// 		{ name: 'Project', id: 'project' },
// 		{ name: 'Module', id: 'module' },
// 		{ name: 'Subject', id: 'subject' }
// 	];

// 	// Function to load data
// 	var loadData = function() {
// 		frappe.call({
// 			method: 'frappe.support_application.doctype.support_exp.support_exp.get_support_exp_data', // Replace with the actual path to your method
// 			callback: function(response) {
// 				// Prepare the data for the DataTable
// 				var rows = response.message.map((item, index) => [index + 1, item.name, item.project, item.module, item.subject]);

// 				// Initialize the DataTable
// 				const datatable = new DataTable(wrapper, {
// 					columns: columns,
// 					data: rows,
// 					inlineFilters: true,
// 					serialNoColumn:false
// 				});
// 				datatable.style.setStyle('.dt-cell--col-1', { backgroundColor: '#f0f0f0' });

// 				// Simulate a filter change event
// 				var originalData = datatable.datamanager.data.slice();
// 				datatable.on('datatable.sort', function() {
// 					var filteredData = datatable.datamanager.data;
// 					if (JSON.stringify(originalData) !== JSON.stringify(filteredData)) {
// 						filteredData.forEach((row, index) => {
// 							row[0] = index + 1; // Update the serial number
// 						});
// 						datatable.refresh();
// 					}
// 				});
// 			}
// 		});
// 	};

// 	loadData(); // Load the data initially
// };
