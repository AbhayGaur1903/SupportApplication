frappe.pages['developer-tickets'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Developers Ticket Resolution Dashboard',
        single_column: true
    });

    var dateRangeField = page.add_field({
        label: "Date Range",
        fieldtype: 'Date Range',
        fieldname: 'date_range'
    });

    var projectsField = page.add_field({
        label: "Projects",
        fieldtype: 'Select',
        fieldname: 'projects',
    });

	let clearFilterButton = page.add_field({
		label: "Clear Filter",
		fieldtype: 'Button',
		fieldname: 'clear_filter',
		click: function() {
			// Clear the input values
			dateRangeField.set_value(null);
			// moduleField.set_value(null);
			projectsField.set_value(null);

			// Re-render the datatable without filters
			fetchData();
		}
	});

    var tableContainer = $('<div></div>').appendTo(page.main);
    var table = createModernTable(tableContainer);

    projectsField.$input.on("change", fetchData);
    dateRangeField.$input.on("change", fetchData);

	function createModernTable(container) {
		let table = $('<table class="modern-table"></table>').appendTo(container);
		table.css('margin-top', '14px');
		let thead = $('<thead></thead>').appendTo(table);
		let headerRow = $('<tr></tr>').appendTo(thead);
		$('<th style="text-align: center;">Developer</th>').appendTo(headerRow);
		
		$('<th style="text-align: center;">Completed Tickets</th>').appendTo(headerRow);
		$('<th style="text-align: center;">Pending Tickets</th>').appendTo(headerRow);
        $('<th style="text-align: center;">Total Tickets</th>').appendTo(headerRow);
	
		$('<tbody></tbody>').appendTo(table);
		return table;
	}
	
    function fetchData() {
        var selectedDateRange = dateRangeField.get_value();
        var selectedProject = projectsField.get_value();
    
        var start_date_cl = null;
        var end_date_cl = null;
    
        if (Array.isArray(selectedDateRange) && selectedDateRange.length === 2) {
            start_date_cl = selectedDateRange[0];
            end_date_cl = selectedDateRange[1];
        }
    
        // Rest of your code with the AJAX call
        frappe.call({
            method: 'frappe.support_application.page.developer_tickets.developer_tickets.get_developer_tickets',
            args: {
                start_date_cl: start_date_cl,
                end_date_cl: end_date_cl,
                project: selectedProject || null
            },
            callback: function (response) {
                if (response && response.message) {
                    var data = response.message;
    
                    // Clear existing table data
                    table.find('tbody').empty();
    
                    var completedTotal = 0;
                    var pendingTotal = 0;
                    var totalTotal = 0;
    
                    // Populate the table with data
                    for (var i = 0; i < data.length; i++) {
                        var row = $('<tr></tr>').appendTo(table.find('tbody'));
                        $('<td>' + data[i].developers + '</td>').appendTo(row);
                        $('<td class="clickable-number">' + data[i]['Completed Tickets'] + '</td>').appendTo(row);
                        $('<td class="clickable-number">' + data[i]['Pending Tickets'] + '</td>').appendTo(row);
                        $('<td class="clickable-number">' + data[i]['Total Tickets'] + '</td>').appendTo(row);
    
                        completedTotal += parseFloat(data[i]['Completed Tickets']);
                        pendingTotal += parseFloat(data[i]['Pending Tickets']);
                        totalTotal += parseFloat(data[i]['Total Tickets']);
                    }
    
                    // Add the total row
                    var totalRow = $('<tr></tr>').appendTo(table.find('tbody'));
                    $('<td><strong>Total</strong></td>').appendTo(totalRow);
                    $('<td><strong>' + completedTotal + '</strong></td>').appendTo(totalRow);
                    $('<td><strong>' + pendingTotal + '</strong></td>').appendTo(totalRow);
                    $('<td><strong>' + totalTotal + '</strong></td>').appendTo(totalRow);
    
                    // Add click event listeners to clickable-number cells
                    table.find('.clickable-number').click(function () {
                        var dateRange = selectedDateRange;
                        var developerRowItem = $(this).closest('tr').find('td:first-child').text(); // Get the developer name
                        var isCompleted = $(this).index() === 1;  // Check if it's the completed column
                        var isPending = $(this).index() === 2; 
                        var isTotal = $(this).index() === 3;  // Check if it's the pending column
                
                        // Prepare filters based on the clicked column
                        
                        if (isCompleted) {
                            completed= 1;
                        } else if (isPending) {
                            completed = 0;
                        } else if (isTotal){
                            completed = 11;
                        }
                
                        set_route_to_list(developerRowItem, completed,dateRange
                            
                            
                            
                            
                            
                            );
                    });
                } else {
                    console.error('Failed to fetch data.');
                }
            }
        });
    }
    
    
    function set_route_to_list(developerRowItem, completed,dateRange) {

        var selectedProject = projectsField.get_value();
        
        if (completed == 1){
            var routeOptions = {
                'developer': developerRowItem,
                'completed':1
            };
        }
        else if((completed == 0)) {
            var routeOptions = {
                'developer': developerRowItem,
                'completed':0
            };
        }
        else{
            var routeOptions = {
                'developer': developerRowItem

            };
        }

        if (selectedProject) {
            routeOptions['project'] = selectedProject;
        }
    
    // if (dateRange && dateRange.length === 2) {
        //     routeOptions['initialtion_datetime'] = ['Between', dateRange[0], dateRange[1]];
        
        // }
        
    
        frappe.set_route('List', 'Support EXP', routeOptions);
    }
    
    
    
    
	

    // Call the function to fetch data based on user input when the page loads
    fetchData();

    function fetchDistinctProjects() {
        frappe.call({
            method: 'frappe.support_application.page.developer_tickets.developer_tickets.get_distinct_projects',
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

    // Call the function to fetch distinct projects when the page loads
    fetchDistinctProjects();
}
