let columns
let rows

frappe.pages['incharge-dashboard'].on_page_load = function(wrapper) {
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
			title: 'Incharge Report',
			single_column: true
		});

		let projectsField = page.add_field({
			label: "Projects",
			fieldtype: 'Select',
			fieldname: 'projects',
			options: [],
			// hidden: true,
 
		});
	
		let moduleField = page.add_field({
			label: "Module",
			fieldtype: 'Select',
			fieldname: 'module',
			options: [],
			// onload: fetchDistinctModules()
		});
	
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
				projectsField.set_value(null);
	
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


	
		return page;
	}
	

    function getFilteredValues() {
        const dateRange = page.fields_dict.date_range.get_value() || [null, null];
        return {
            project: page.fields_dict.projects.get_value(),
            module: page.fields_dict.module.get_value(),
            from_date: dateRange[0],
            to_date: dateRange[1]
        };
    }

    function setPrimaryAction() {
        frappe.route_options = getFilteredValues();
        frappe.set_route('List', 'Support EXP');
    }

    function fetchDistinctProjects() {
		if (frappe.user.has_role('Expedien HOD')){
			frappe.call({
				method: 'frappe.support_application.page.project_status.support_dashboard.get_distinct_projects',
				callback: function(response) {
					page.fields_dict.projects.df.options = response.message;
					page.fields_dict.projects.refresh();
				}
			});
		}
		else if(frappe.user.has_role('Project Coordinator')||frappe.user.has_role('Department HOD')){
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
			{ name: 'Action', id: 'action' },
			// { name: 'Sno', id: 'sequence' },
			{ name: 'Ticket ID', id: 'ticket_id' },
			{ name: 'Project', id: 'project' },
			{ name: 'Task', id: 'task' },
			{ name: 'Status', id: 'workflow_state' },
			{ name: 'Module', id: 'module' },
			
			{ name: 'Subject', id: 'subject' },
			{ name: 'Description', id: 'description' },
			
		];

		applyDatatableStyles(datatable_container);

		rows = response.message.map(item => [
			'<button class="btn btn-primary route-btn" data-id="' + item.name + '">View</button>',
			// item.sequence,
			item.ticket_id,
			item.project,
			item.task,
	
			item.workflow_state,
			item.module,

	
			item.subject,
			item.description,

		]);

		datatable = new DataTable(datatable_container[0], {
			columns: columns,
			data: rows,
			serialNoColumn: false,
			inlineFilters: true,

		});
	
		datatable.style.setStyle('.dt-cell--col-1', { backgroundColor: '#f0f0f0' });
	
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
	

	
	

	function convertToCSV(columns, rows) {
		// Exclude the first column (Action) when mapping columns and add ID to make headers bold
		let csv = columns.slice(1).map(col => `"${col.name}"`).join(",") + "\n";
		
		// Add a bottom border by adding a line of equal signs ('======') under the headers
		csv += columns.slice(1).map(() => "======").join(",") + "\n";
	
		csv += rows.map(row => {
			// Exclude the first cell (Action) from each row
			return row.slice(1).map(cell => {
				if (cell === null || cell === undefined) {
					return '""';
				}
				return `"${cell.toString().replace(/"/g, '""')}"`;
			}).join(",");
		}).join("\n");
	
		return csv;
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
	}
	


}
