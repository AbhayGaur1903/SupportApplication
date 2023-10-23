frappe.pages['weekly-summary-repor'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Weekly Summary Report',
        single_column: true
    });

	

	

    // Create a container for the tables
    var tableContainer = $('<div id="tables-container"></div>').appendTo(page.body);

    function createAndPopulateTable(containerId, columns, headingText, data) {
        // Create the table heading
        var heading = $('<h2 class="custom-header">' + headingText + '</h2>').appendTo(tableContainer);

        // Create the table container inside the main tableContainer
        var innerTableContainer = $('<div class="scrollable-table"></div>').appendTo(tableContainer);

        // Create the table
        var table = $('<table class="table table-bordered"></table>').appendTo(innerTableContainer);

        // Add table headers
        var thead = $('<thead></thead>').appendTo(table);
        var headerRow = $('<tr></tr>').appendTo(thead);
        for (var i = 0; i < columns.length; i++) {
            $('<th>' + columns[i] + '</th>').appendTo(headerRow);
        }

        // Add table body
        var tbody = $('<tbody></tbody>').appendTo(table);

        // Populate the table with data
        for (var i = 0; i < data.length; i++) {
            addTableRow(tbody, data[i]);
        }

        function addTableRow(tbody, rowData) {
            var row = $('<tr></tr>').appendTo(tbody);
            for (var i = 0; i < columns.length; i++) {
                var columnName = columns[i];
                var cellValue = rowData[columnName.toLowerCase()];
                $('<td>' + cellValue + '</td>').appendTo(row);
            }
        }
    }

    function getData(method, dateRange, project) {
        return new Promise((resolve, reject) => {
            frappe.call({
                method: method,
                args: {
                    start_date_cl: dateRange[0],
                    end_date_cl: dateRange[1],
                    project: project
                },
                callback: function(response) {
                    if (response.message) {
                        // console.log(JSON.stringify(response.message));
                        resolve(response.message);
                    } else {
                        reject(new Error('No data returned'));
                    }
                }
            });
        });
    }

    function populateTables(dateRange, project) {
        // Clear existing tables
        $('#tables-container').empty();
    
        Promise.all([
            getData('frappe.support_application.page.weekly_summary_repor.weekly_report.get_completed_deliveries', dateRange, project),
            getData('frappe.support_application.page.weekly_summary_repor.weekly_report.get_upcoming_deliveries', dateRange, project),
            getData('frappe.support_application.page.weekly_summary_repor.weekly_report.get_client_discussion', dateRange, project),
            getData('frappe.support_application.page.weekly_summary_repor.weekly_report.get_tickets', dateRange, project)
        ])
        .then(data => {
            // Convert the Resolved Tickets and Pending Tickets data to clickable links
            data[3].forEach(ticket => {
                ticket.resolved_tickets = `<a href="#" class="ticket-link resolved">${ticket.resolved_tickets}</a>`;
                ticket.pending_tickets = `<a href="#" class="ticket-link pending">${ticket.pending_tickets}</a>`;
            });
    
            // Populate tables
            createAndPopulateTable('completed-deliveries-table', ['Date', 'Module', 'Description'], 'Completed Deliveries', data[0]);
            createAndPopulateTable('upcoming-deliveries-table', ['Date', 'Module', 'Description'], 'Upcoming Deliveries', data[1]);
            createAndPopulateTable('client-discussion-table', ['User','Type', 'Discussion_Details', 'Target'], 'Client Discussion', data[2]);
            createAndPopulateTable('ticket-table', ['Total_Tickets', 'Resolved_Tickets', 'Pending_Tickets'], 'Tickets', data[3]);
    
            // Attach click event listeners to the Resolved and Pending ticket links
            
            
            
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }

    

    $(document).on('click', '.ticket-link.resolved', function(e) {
        e.preventDefault();
        console.log("Resolved ticket link clicked"); // Debugging
        date_range = dateRangeField.get_value();
        project_url = projectField.get_value();
        show_completed_ticket_status(date_range,project_url)
        // ... [Your logic here] ...
    });

    $(document).on('click', '.ticket-link.pending', function(e) {
        e.preventDefault();
        console.log("Pending ticket link clicked"); // Debugging
        date_range = dateRangeField.get_value();
        project_url = projectField.get_value();
        show_pending_ticket_status(date_range,project_url)
        // ... [Your logic here] ...
    });
    
    function show_completed_ticket_status(dateRange, project_url) {
        frappe.call({
            method: "frappe.support_application.doctype.weekly_project_status_exp.weekly_project_status_exp.get_completed_tickets_count",
            args: {
                start_date: dateRange[0],
                end_date: dateRange[1],
                project: project_url
            },
            callback: function(response) {
                var options_html = response.message;
    
                // Defining the button action
                var primary_action_label = "View Resolved Tickets";
                var primary_action = function() {
                    frappe.set_route('List', 'Support EXP', {
                        'initialtion_datetime': ['between', [dateRange[0], dateRange[1]]],
                        'project': project_url,
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
    
    function show_pending_ticket_status(dateRange, project_url) {
        frappe.call({
            method: "frappe.support_application.doctype.weekly_project_status_exp.weekly_project_status_exp.get_pending_tickets_count",
            args: {
                start_date: dateRange[0],
                end_date: dateRange[1],
                project: project_url
            },
            callback: function(response) {
                var options_html = response.message;
    
                // Defining the button action
                var primary_action_label = "View Pending Tickets";
                var primary_action = function() {
                    frappe.set_route('List', 'Support EXP', {
                        'initialtion_datetime': ['between', [dateRange[0], dateRange[1]]],
                        'project': project_url,
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
    
    

    let dateRangeField = page.add_field({
        label: "Date Range",
        fieldtype: 'Date Range',
        fieldname: 'date_range',
        change: function() {
            var dateRange = dateRangeField.get_value();
            var project = projectField.get_value();
            if (dateRange) {
                // Clear existing tables
                $('#tables-container').empty();
                // Trigger the function to fetch and populate data based on the selected date range and project
                populateTables(dateRange, project);
            }
        }
    });

	let projectField = page.add_field({
        label: "Project",
        fieldtype: 'Select',
        fieldname: 'project',
        change: function () {
            var project = projectField.get_value();
            var dateRange = dateRangeField.get_value();
            if (dateRange && project) {
                populateTables(dateRange, project);
            }
        }
    });

	let clearFilterButton = page.add_field({
        label: 'Clear Filters',
        fieldtype: 'Button',
        click: function() {
            // Clear the filters
            dateRangeField.set_input('');
            projectField.set_input('');
            // Clear the tables
            $('#tables-container').empty();
        }
    });
	function fetchDistinctProjects() {
        frappe.call({
            method: 'frappe.support_application.page.weekly_summary_repor.weekly_report.get_distinct_projects',
            callback: function (response) {
                if (response && response.message) {
                    projectField.df.options = response.message;
                    projectField.refresh();
                } else {
                    console.error('Failed to fetch distinct projects.');
                }
            }
        });
    }

    // Call fetchDistinctProjects to populate the options when the page loads
    fetchDistinctProjects();

console.log("on_page_load attached!");   

    // // Get the current date
    // var currentDate = new Date();

    // // Get the date from one month ago
    // var oneMonthAgoDate = new Date();
    // oneMonthAgoDate.setMonth(currentDate.getMonth() - 1);

    // // Format dates to YYYY-MM-DD
    // function formatDate(d) {
    //     var month = '' + (d.getMonth() + 1);
    //     var day = '' + d.getDate();
    //     var year = d.getFullYear();

    //     if (month.length < 2) month = '0' + month;
    //     if (day.length < 2) day = '0' + day;

    //     return [year, month, day].join('-');
    // }

    // // Set default value for dateRangeField as last one month
    // dateRangeField.set_input([formatDate(oneMonthAgoDate), formatDate(currentDate)]);

    // // Call the function to populate tables with the default date range when the page loads
    // populateTables([formatDate(oneMonthAgoDate), formatDate(currentDate)]);

	function getQueryParams() {
		let queryString = window.location.search;
		let urlParams = new URLSearchParams(queryString);
		
		return {
			weekStartDate: urlParams.get('weekStartDate'),
			weekEndDate: urlParams.get('weekEndDate'),
			project: urlParams.get('project')
		};
	}
	
	let params = getQueryParams();
	
	if (params.weekStartDate && params.weekEndDate && params.project) {
		dateRangeField.set_input([params.weekStartDate, params.weekEndDate]);
		projectField.set_input(params.project);
		populateTables([params.weekStartDate, params.weekEndDate], params.project);
	} else {
        // Your existing logic to set default values (e.g., for the current month)
		var currentDate = new Date();

		// Get the first day of the current month
		var firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

		// Get the last day of the current month
		var lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // 0 gives the last day of previous month

		// Format dates to YYYY-MM-DD
		function formatDate(d) {
			var month = '' + (d.getMonth() + 1);
			var day = '' + d.getDate();
			var year = d.getFullYear();

			if (month.length < 2) month = '0' + month;
			if (day.length < 2) day = '0' + day;

			return [year, month, day].join('-');
		}

		// Set default value for dateRangeField as the entire current month
		dateRangeField.set_input([formatDate(firstDayOfMonth), formatDate(lastDayOfMonth)]);

		// Call the function to populate tables with the default date range when the page loads
		populateTables([formatDate(firstDayOfMonth), formatDate(lastDayOfMonth)]);

    }

	let printButton = page.add_field({
		label: 'Print',
		fieldtype: 'Button',
		 // Add this line to style the button as primary
		click: function() {
			
		    console.log(document.getElementById("tables-container"));

			// Trigger the print functionality
			window.print();
		}
	});
	
	
    

    

    var customCSS = `
        .scrollable-table {
            /*overflow-x: auto;
            overflow-y: auto; 
            height: 150px; */
			margin-bottom:15px;
        }
		.btn btn-secondary btn-default btn-sm{
			background-color: wheat;
		}
        .scrollable-table tr th{
            background: #f6f8f9; 
            background: linear-gradient(to bottom,  #f6f8f9 0%,#e5ebee 50%,#d7dee3 51%,#f5f7f9 100%);
            filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f6f8f9', endColorstr='#f5f7f9',GradientType=0 );
            font-weight:500;
        }
        .scrollable-table tr td, .scrollable-table tr th {
            font-size: 13px;
            border: solid 1px #dfdfdf;
            color: #000;
        }
        .scrollable-table .table {
            width: 100%;
            border-collapse: collapse;
            font-size: 1rem;
            color: #333; margin:0;
        }
        .layout-main-section { 
            background: #fff; padding:10px;
        }
        .table th, 
        .table td {
            border: 2px solid #fff;
            padding: 12px 15px;
            text-align: left;
        }
        .table th {
            position: sticky;
            top: 0;
            z-index: 10;
            background-color: #f6f6f6;
            color: #555;
            font-weight: 500;
        }
        .table tbody tr:last-child th, 
        .table tbody tr:last-child td {
            border-bottom: none;
        }
        .table tr:hover {
            background-color: #f9f9f9;
        }
		

		
    `;

    $("<style></style>").html(customCSS).appendTo("head");
};
