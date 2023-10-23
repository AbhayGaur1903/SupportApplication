frappe.pages['project-status'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Project Status Dashboard',
        single_column: true
    });

	
	var projectsField = addSelectField({
		page: page,
		label: "Projects",
		fieldname: 'projects',
		onChange: function() {
			fetchDistinctModules(projectsField.get_value());
		}
	});
	
    let datarangeField = page.add_field({
        label: "Date Range",
        fieldtype: 'Date Range',
        fieldname: 'date_range'
    });

	// "Clear Filter" button definition
	let clearFilterButton = page.add_field({
		label: "Clear Filter",
		fieldtype: 'Button',
		fieldname: 'clear_filter',
		click: function() {
			// Clear the input values
			datarangeField.set_value(null);
			// moduleField.set_value(null);
			projectsField.set_value(null);

			// Re-render the datatable without filters
			loadPendingAndResolvedCounts();
		}
	});

    fetchDistinctProjects();

    var tableContainer = $('<div></div>').appendTo(page.main);
    var table = createModernTable(tableContainer);

    projectsField.$input.on("change", fetchData);
    datarangeField.$input.on("change", fetchData);

    function fetchData() {
        var selectedProject = projectsField.get_value();
        var datarange = datarangeField.get_value();
        loadPendingAndResolvedCounts(selectedProject, datarange);
    }

    function addSelectField({page, label, fieldname, onChange}) {
        return page.add_field({
            label: label,
            fieldtype: 'Select',
            fieldname: fieldname,
            options: [],
            change: onChange
        });
    }

    function fetchDistinctProjects() {
        frappe.call({
            method: 'frappe.support_application.page.project_status.support_dashboard.get_distinct_projects',
            callback: function(response) {
                if (response && response.message) {
                    projectsField.df.options = response.message;
                    projectsField.refresh();
                } else {
                    console.error('Failed to fetch distinct projects.');
                }
            }
        });
    }

    function fetchDistinctModules(selectedProject) {
        frappe.call({
            method: 'frappe.support_application.page.project_status.support_dashboard.get_distinct_modules',
            args: {
                project: selectedProject
            },
            callback: function(response) {
                if (response && response.message) {
                    // Assuming modulesField is defined and needed
                    // modulesField.df.options = response.message;
                    // modulesField.refresh();
                } else {
                    console.error('Failed to fetch distinct modules.');
                }
            }
        });
    }

	function createModernTable(container) {
		let table = $('<table class="modern-table"></table>').appendTo(container);
		table.css('margin-top', '14px'); // Add this line to set the margin-top
		let thead = $('<thead></thead>').appendTo(table);
		$('<tr><th style="text-align: center;">Project/Module</th><th style="text-align: center;">Pending Tickets</th><th style="text-align: center;">Resolved Tickets</th><th style="text-align: center;">Total Received Tickets</th></tr>').appendTo(thead);

		$('<tbody></tbody>').appendTo(table);
		return table;
	}
	
	
	

	function populateTable(table, data) {
		let tbody = table.find('tbody');
		tbody.empty();
	
		let totalPending = 0;
		let totalResolved = 0;
		let totalReceived = 0;
	
		for (let key in data) {
			if (data.hasOwnProperty(key)) {
				let pendingCount = data[key]["Pending"] || 0;
				let resolvedCount = data[key]["Resolved"] || 0;
				let receivedCount = pendingCount + resolvedCount;
	
				totalPending += pendingCount;
				totalResolved += resolvedCount;
				totalReceived += receivedCount;
	
				let base_url = "http://123.253.160.124:8000/app/support-exp/view/list";
				var datarange_url = datarangeField.get_value();
				var selectedProject_url = projectsField.get_value();
				var rowHTML;
	
				if (selectedProject_url) {  // If a project is selected, display counts as plain text.
					rowHTML = `
						<tr>
							<td style="padding: 8px; text-align: center;">${key}</td>
							<td style="padding: 8px; text-align: center;">${pendingCount}</td>
							<td style="padding: 8px; text-align: center;">${resolvedCount}</td>
							<td style="padding: 8px; text-align: center;">${receivedCount}</td>
						</tr>
					`;
				} else {  // If no project is selected, display counts as hyperlinks.
					if (datarange_url) {
						var start_date_url = datarange_url[0]
						var end_date_url = datarange_url[1]
						var pendingURL = `${base_url}?workflow_state=%5B%22in%22%2C%5B%22Submitted%22%2C%22Approved%2C%22Assigned%20Work%22%2C%22In%20Progress%22%5D%5D&initialtion_datetime=%5B%22Between%22%2C%5B%22${start_date_url}%22%2C%22${end_date_url}%22%5D%5D&project=${key}`;
						var resolvedURL = `${base_url}?workflow_state=%5B%22in%22%2C%5B%22Close%22%2C%22Completed%22%5D%5D&initialtion_datetime=%5B%22Between%22%2C%5B%22${start_date_url}%22%2C%22${end_date_url}%22%5D%5D&project=${key}`;
						var totalURL = `${base_url}?project=${key}&initialtion_datetime=%5B%22Between%22%2C%5B%22${start_date_url}%22%2C%22${end_date_url}%22%5D%5D`;
					} else {
						var pendingURL = `${base_url}?workflow_state=%5B%22in%22%2C%5B%22Submitted%22%2C%22Approved%22%2C%22In%20Progress%22%2C%22Assigned%20Work%22%5D%5D&project=${key}`;
						var resolvedURL = `${base_url}?workflow_state=%5B%22in%22%2C%5B%22Close%22%2C%22Completed%22%5D%5D&project=${key}`;
						var totalURL = `${base_url}?project=${key}`;
					}
	
					rowHTML = `
						<tr>
							<td style="padding: 8px; text-align: center;">${key}</td>
							<td style="padding: 8px; text-align: center;"><a href="${pendingURL}" target="_blank">${pendingCount}</a></td>
							<td style="padding: 8px; text-align: center;"><a href="${resolvedURL}" target="_blank">${resolvedCount}</a></td>
							<td style="padding: 8px; text-align: center;"><a href="${totalURL}" target="_blank">${receivedCount}</a></td>
						</tr>
					`;
				}
	
				$(rowHTML).appendTo(tbody);
			}
		}
	
		// Add the total row
		let totalRowHTML = `
			<tr>
				<td style="padding: 8px; text-align: center;"><strong>Total</strong></td>
				<td style="padding: 8px; text-align: center;"><strong>${totalPending}</strong></td>
				<td style="padding: 8px; text-align: center;"><strong>${totalResolved}</strong></td>
				<td style="padding: 8px; text-align: center;"><strong>${totalReceived}</strong></td>
			</tr>
		`;
	
		$(totalRowHTML).appendTo(tbody);
	}
	
	
	function convertDateFormat(inputDate) {
		// Split the input date string into an array
		var dateParts = inputDate.split("-");
	  
		// Rearrange the parts in the desired order
		var convertedDate = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
	  
		return convertedDate;
	  }


	function loadPendingAndResolvedCounts(project, datarange) {
		var args = {};
		if (datarange) {
			args.start_date = datarange[0];
			args.end_date = datarange[1];
		}
		if (project) {
			args.project = project;
		}

		frappe.call({
			method: 'frappe.support_application.page.project_status.support_dashboard.pending_and_completed_ticket_count',
			args: args,
			callback: function (response) {
				if (response && response.message) {
					for (let key in response.message) {
						if (response.message.hasOwnProperty(key)) {
							let pendingCount = response.message[key]["Pending"] || 0;
							let resolvedCount = response.message[key]["Resolved"] || 0;

							// Calculate the received tickets count
							response.message[key]["Received"] = pendingCount + resolvedCount;
						}
					}
					populateTable(table, response.message);
				} else {
					frappe.msgprint("User is not an 'Expedien HOD'.");
				}
			}
		});
	}

	fetchData();

};








/////////////////////////////////////



    // function populateTable(table, data) {
		
	// 	let tbody = table.find('tbody');
	// 	tbody.empty();
	// 	for (let key in data) {
	// 		if (data.hasOwnProperty(key)) {
	// 			let pendingCount = data[key]["Pending"] || 0;
	// 			let resolvedCount = data[key]["Resolved"] || 0;
	// 			let receivedCount = pendingCount + resolvedCount;
	
	// 			// Creating hyperlinks for both Pending and Resolved columns
	// 			let base_url = "http://192.168.10.21:8000/app/support-exp/view/list";
	// 			datarange_url = datarangeField.get_value();
	// 			if (datarange_url){
	// 				// var start_date_url = convertDateFormat(datarange_url[0])
	// 				// var end_date_url = convertDateFormat(datarange_url[1])
	// 				var start_date_url = datarange_url[0]
	// 				var end_date_url = datarange_url[1]

	// 				console.log("start_date_url: ", start_date_url);
	// 				console.log("end_date_url: ", end_date_url);
	// 				var pendingURL = `${base_url}?workflow_state=%5B%22in%22%2C%5B%22Submitted%22%2C%22Approved%22%2C%22In%20Progress%22%5D%5D&initialtion_datetime=%5B%22Between%22%2C%5B%22${start_date_url}%22%2C%22${end_date_url}%22%5D%5D&project=${key}`;
	// 				var resolvedURL = `${base_url}?workflow_state=%5B%22in%22%2C%5B%22Close%22%2C%22Completed%22%5D%5D&initialtion_datetime=%5B%22Between%22%2C%5B%22${start_date_url}%22%2C%22${end_date_url}%22%5D%5D&project=${key}`;
	// 				var totalURL = `${base_url}?project=${key}&initialtion_datetime=%5B%22Between%22%2C%5B%22${start_date_url}%22%2C%22${end_date_url}%22%5D%5D`
	// 			}
	// 			else{
	// 				var pendingURL = `${base_url}?workflow_state=%5B%22in%22%2C%5B%22Submitted%22%2C%22Approved%22%2C%22In%20Progress%22%5D%5D&project=${key}`;
	// 				var resolvedURL = `${base_url}?workflow_state=%5B%22in%22%2C%5B%22Close%22%2C%22Completed%22%5D%5D&project=${key}`;
	// 				var totalURL = `${base_url}?project=${key}`
					
	// 			}

	// 			// Constructing the table row with the hyperlinks
	// 			// let rowHTML = `
	// 			// 	<tr>
	// 			// 		<td>${key}</td>
	// 			// 		<td class="center-align"><a href="${pendingURL}" target="_blank">${pendingCount}</a></td>
	// 			// 		<td class="center-align"><a href="${resolvedURL}" target="_blank">${resolvedCount}</a></td>
	// 			// 		<td class="center-align"><a href="${totalURL}" target="_blank">${receivedCount}</td> <!-- New column -->
	// 			// 	</tr>
	// 			// `;
	// 			let rowHTML = `
	// 				<tr>
	// 					<td style="padding: 8px; text-align: center;">${key}</td>
	// 					<td style="padding: 8px; text-align: center;"><a href="${pendingURL}" target="_blank">${pendingCount}</a></td>
	// 					<td style="padding: 8px; text-align: center;"><a href="${resolvedURL}" target="_blank">${resolvedCount}</a></td>
	// 					<td style="padding: 8px; text-align: center;"><a href="${totalURL}" target="_blank">${receivedCount}</a></td>
	// 				</tr>
	// 			`;

	// 			$(rowHTML).appendTo(tbody);
	// 		}
	// 	}
	// }
	// function populateTable(table, data) {
	// 	let tbody = table.find('tbody');
	// 	tbody.empty();
	
	// 	for (let key in data) {
	// 		if (data.hasOwnProperty(key)) {
	// 			let pendingCount = data[key]["Pending"] || 0;
	// 			let resolvedCount = data[key]["Resolved"] || 0;
	// 			let receivedCount = pendingCount + resolvedCount;
	
	// 			let base_url = "http://192.168.10.21:8000/app/support-exp/view/list";
	// 			var datarange_url = datarangeField.get_value();
	// 			var selectedProject_url = projectsField.get_value();
	// 			var rowHTML;
	
	// 			if (selectedProject_url) {  // If a project is selected, display counts as plain text.
	// 				rowHTML = `
	// 					<tr>
	// 						<td style="padding: 8px; text-align: center;">${key}</td>
	// 						<td style="padding: 8px; text-align: center;">${pendingCount}</td>
	// 						<td style="padding: 8px; text-align: center;">${resolvedCount}</td>
	// 						<td style="padding: 8px; text-align: center;">${receivedCount}</td>
	// 					</tr>
	// 				`;
	// 			} else {  // If no project is selected, display counts as hyperlinks.
	// 				if (datarange_url) {
	// 					var start_date_url = datarange_url[0]
	// 					var end_date_url = datarange_url[1]
	// 					var pendingURL = `${base_url}?workflow_state=%5B%22in%22%2C%5B%22Submitted%22%2C%22Approved%22%2C%22In%20Progress%22%5D%5D&initialtion_datetime=%5B%22Between%22%2C%5B%22${start_date_url}%22%2C%22${end_date_url}%22%5D%5D&project=${key}`;
	// 					var resolvedURL = `${base_url}?workflow_state=%5B%22in%22%2C%5B%22Close%22%2C%22Completed%22%5D%5D&initialtion_datetime=%5B%22Between%22%2C%5B%22${start_date_url}%22%2C%22${end_date_url}%22%5D%5D&project=${key}`;
	// 					var totalURL = `${base_url}?project=${key}&initialtion_datetime=%5B%22Between%22%2C%5B%22${start_date_url}%22%2C%22${end_date_url}%22%5D%5D`;
	// 				} else {
	// 					var pendingURL = `${base_url}?workflow_state=%5B%22in%22%2C%5B%22Submitted%22%2C%22Approved%22%2C%22In%20Progress%22%5D%5D&project=${key}`;
	// 					var resolvedURL = `${base_url}?workflow_state=%5B%22in%22%2C%5B%22Close%22%2C%22Completed%22%5D%5D&project=${key}`;
	// 					var totalURL = `${base_url}?project=${key}`;
	// 				}
	
	// 				rowHTML = `
	// 					<tr>
	// 						<td style="padding: 8px; text-align: center;">${key}</td>
	// 						<td style="padding: 8px; text-align: center;"><a href="${pendingURL}" target="_blank">${pendingCount}</a></td>
	// 						<td style="padding: 8px; text-align: center;"><a href="${resolvedURL}" target="_blank">${resolvedCount}</a></td>
	// 						<td style="padding: 8px; text-align: center;"><a href="${totalURL}" target="_blank">${receivedCount}</a></td>
	// 					</tr>
	// 				`;
	// 			}
	
	// 			$(rowHTML).appendTo(tbody);
	// 		}
	// 	}
	// }


	//     function loadPendingAndResolvedCounts(project, datarange) {
// 		var args = {};
// 		if (datarange) {
// 			args.start_date = datarange[0];
// 			args.end_date = datarange[1];
// 			// start_date = datarange[0];
// 			// end_date = datarange[1];
// 		}
// 		if (project) {
// 			args.project = project;
// 		}
	
// 		frappe.call({
// 			method: 'frappe.support_application.page.project_status.support_dashboard.pending_and_completed_ticket_count',
// 			args: args,
// 			callback: function(response) {
// 				if (response && response.message) {
// 					for (let key in response.message) {
// 						if (response.message.hasOwnProperty(key)) {
// 							let pendingCount = response.message[key]["Pending"] || 0;
// 							let resolvedCount = response.message[key]["Resolved"] || 0;
	
// 							// Calculate the received tickets count
// 							response.message[key]["Received"] = pendingCount + resolvedCount;
// 						}
// 					}
// 					populateTable(table, response.message);
// 				} else {
// 					frappe.msgprint("User is not an 'Expedien HOD'.");
// 				}
// 			}
// 		});
// 	}
	

//     fetchData();