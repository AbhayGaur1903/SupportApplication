frappe.pages['my-page'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Reports',
        single_column: true
    });

    let projectsField = page.add_field({
        label: "Projects",
        fieldtype: 'Select',
        fieldname: 'projects',
        options: [],
        change: function() {
            fetchDistinctModules(projectsField.get_value());
        }
    });

    // let modulesField = page.add_field({
    //     label: "Module",
    //     fieldtype: 'Select',
    //     fieldname: 'module',
    //     options: []
    // });

    let datarangeField = page.add_field({
        label: "Date Range",
        fieldtype: 'Date Range',
        fieldname: 'date_range'
    });


    frappe.call({
        method: 'frappe.support_application.page.my_page.support_dashboard.get_distinct_projects',
        callback: function(response) {
            var distinctProjects = response.message;
            projectsField.df.options = distinctProjects;
            projectsField.refresh();
        }
    });

    function fetchDistinctModules(selectedProject) {
        frappe.call({
            method: 'frappe.support_application.page.my_page.support_dashboard.get_distinct_modules',
            args: {
                project: selectedProject
            },
            callback: function(response) {
                var distinctModules = response.message;
                modulesField.df.options = distinctModules;
                modulesField.refresh();
            }
        });
    }

$(document).ready(function() {
    let tableContainer = $('<div></div>').appendTo(page.main);
    let table = $('<table class="table table-bordered"></table>').appendTo(tableContainer);  
    let thead = $('<thead></thead>').appendTo(table);
    let headerRow = $('<tr><th>Project/Module</th><th>Pending Tickets</th><th>Resolved Tickets</th></tr>').appendTo(thead);
    let tbody = $('<tbody></tbody>').appendTo(table);
    tbody.empty();

    function populateTable(data) {
        tbody.empty();
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var pendingCount = data[key]["Pending"] || 0;
                var resolvedCount = data[key]["Resolved"] || 0;

                var row = $('<tr><td>' + key + '</td><td>' + pendingCount + '</td><td>' + resolvedCount + '</td></tr>');
                tbody.append(row);
            }
        }
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
            method: 'frappe.support_application.page.my_page.support_dashboard.pending_and_completed_ticket_count',
            args: args,
            callback: function(response) {
                var counts = response.message;
                console.log(counts); 
                if (counts) {
                    populateTable(counts);
                } else {
                    frappe.msgprint("User is not an 'Expedien HOD'.");
                }
            }
        });
    }

    projectsField.$input.on("change", function() {
        var selectedProject = projectsField.get_value();
        var datarange = datarangeField.get_value();
        loadPendingAndResolvedCounts(selectedProject, datarange);
    });

    datarangeField.$input.on("change", function() {
        var selectedProject = projectsField.get_value();
        var datarange = datarangeField.get_value();
        loadPendingAndResolvedCounts(selectedProject, datarange);
    });

    loadPendingAndResolvedCounts();

});

};
