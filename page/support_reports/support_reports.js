// frappe.pages['support-reports'].on_page_load = function(wrapper) {
//     var page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Support Report',
//         single_column: true
//     });

//     // Create filters
//     var from_date_filter = page.add_field({
//         fieldname: 'from_date',
//         label: 'From Date',
//         fieldtype: 'Date'
//     });

//     var to_date_filter = page.add_field({
//         fieldname: 'to_date',
//         label: 'To Date',
//         fieldtype: 'Date'
//     });

//     var project_filter = page.add_field({
//         fieldname: 'project',
//         label: 'Project',
//         fieldtype: 'Link',
//         options: 'Project EXP'  // Replace with your actual Project doctype name
//     });

//     var name_filter = page.add_field({
//         fieldname: 'name',
//         label: 'Name',
//         fieldtype: 'Data'
//     });

//     var module_filter = page.add_field({
//         fieldname: 'module',
//         label: 'Module',
//         fieldtype: 'Link',
//         options: 'Module EXP'  // Replace with your actual Module doctype name
//     });

//     var task_type_filter = page.add_field({
//         fieldname: 'task',
//         label: 'Task Type',
//         fieldtype: 'Link',
//         options: 'Task Type EXP'  // Replace with your actual Task Type doctype name
//     });
// 	var buttonContainer = $('<div class="button-container">');

//     // Add the "Download to Excel" button to the container
//     var downloadButton = $('<button class="btn btn-primary">Download to Excel</button>');
//     buttonContainer.append(downloadButton);
//     // Create a function to fetch and render the data
//     function renderTableData(filters) {
//         frappe.call({
//             method: "frappe.support_application.doctype.support_exp.support_exp.get_support_exp_data",
//             args: {
//                 project: filters.project,
//                 name: filters.name,
//                 module: filters.module,
//                 from_date: filters.from_date,
//                 to_date: filters.to_date,
//                 task_type: filters.task_type,
//                 manager: frappe.session.user
//             },
//             callback: function(response) {
//                 // Clear the previous data
//                 $(wrapper).find('.wrap-table100').remove();
				
// 				// downloadButton.click(function() {
// 				// 	downloadExcel(data);
// 				// });
				
				
// 				var standardActions = $('.standard-actions.flex');
//     			standardActions.append(buttonContainer);
				
//                 // Create table
//                 var table = $('<table class="table100 ver1 m-b-110" data-vertable="ver1">');

//                 // Add table header
//                 var header = $('<tr class="row100 head">')
//                     .append('<th class="column100 column2" data-column="column2">Name</th>')
//                     .append('<th class="column100 column3" data-column="column3">Module</th>')
//                     .append('<th class="column100 column4" data-column="column4">Initiation Date</th>')
//                     .append('<th class="column100 column5" data-column="column5">Subject</th>')
//                     .append('<th class="column100 column6" data-column="column6">Description</th>')
// 					.append('<th class="column100 column6" data-column="column6">Task</th>')
// 					.append('<th class="column100 column7" data-column="column7">Working Hours</th>')
//                     .append('<th class="column100 column8" data-column="column8">Developer</th>')
//                     .append('<th class="column100 column9" data-column="column9">Completion Date</th>')
//                     .append('<th class="column100 column10" data-column="column10">Status</th>');

//                 table.append($('<thead>').append(header));

//                 var tbody = $('<tbody>');
//                 var data = response.message;

//                 // Render the data
//                 data.forEach(function(row) {
//                     var tr = $('<tr class="row100">')
//                         .append('<td class="column100 column2" data-column="column2">' + row.name + '</td>')
//                         .append('<td class="column100 column3" data-column="column3">' + row.module + '</td>')
//                         .append('<td class="column100 column4" data-column="column4">' + row.initialtion_datetime + '</td>')
//                         .append('<td class="column100 column5" data-column="column5">' + row.subject + '</td>')
//                         .append('<td class="column100 column6" data-column="column6">' + row.description + '</td>')
// 						.append('<td class="column100 column6" data-column="column6">' + row.task + '</td>')
// 						.append('<td class="column100 column7" data-column="column7">' + row.actual_hours + '</td>')
//                         .append('<td class="column100 column8" data-column="column8">' + row.developer + '</td>')
//                         .append('<td class="column100 column9" data-column="column9">' + row.actual_end_date + '</td>')
//                         .append('<td class="column100 column10" data-column="column10">' + row.workflow_state + '</td>');
//                     tbody.append(tr);
//                 });

//                 table.append(tbody);

//                 // Append the table to the page body
//                 $('.page-body').append($('<div class="wrap-table100 scrollable-table">').append(table));
//                 $('.page-body').append($('<div class="footer_space"></div)'));

//                 // Add hover effect to the table
//                 (function ($) {
//                     "use strict";
//                     var table = $('.table100');

//                     $(window).on('scroll', function () {
//                         var header = table.find('thead');
//                         var scrollLeft = $(this).scrollLeft();
//                         header.css('transform', 'translateX(' + -scrollLeft + 'px)');
//                     });

//                     $('.column100').on('mouseover', function () {
//                         var table1 = $(this).parent().parent().parent();
//                         var table2 = $(this).parent().parent();
//                         var verTable = $(table1).data('vertable') + "";
//                         var column = $(this).data('column') + "";
//                         $(table2).find("." + column).addClass('hov-column-' + verTable);
//                         $(table1).find(".row100.head ." + column).addClass('hov-column-head-' + verTable);
//                     });

//                     $('.column100').on('mouseout', function () {
//                         var table1 = $(this).parent().parent().parent();
//                         var table2 = $(this).parent().parent();
//                         var verTable = $(table1).data('vertable') + "";
//                         var column = $(this).data('column') + "";
//                         $(table2).find("." + column).removeClass('hov-column-' + verTable);
//                         $(table1).find(".row100.head ." + column).removeClass('hov-column-head-' + verTable);
//                     });
//                 })(jQuery);
//             }
//         });
//     }

//     // Initial rendering of all records
//     renderTableData({});

//     // Modify the "Show" button's callback to refresh the table with filtered data
//     page.set_primary_action(__('Show'), function() {
//         var filters = {
//             project: project_filter.get_value(),
//             name: name_filter.get_value(),
//             module: module_filter.get_value(),
//             from_date: from_date_filter.get_value(),
//             to_date: to_date_filter.get_value(),
//             task_type: task_type_filter.get_value()
//         };

//         renderTableData(filters);

		
		
//     });

// 	// Function to convert data to Excel and initiate download
// 	// function downloadExcel(data) {
// 	// 	var worksheet = XLSX.utils.json_to_sheet(data);
// 	// 	var workbook = XLSX.utils.book_new();
// 	// 	XLSX.utils.book_append_sheet(workbook, worksheet, 'Support_Report');

// 	// 	// Convert the workbook to a binary Excel file
// 	// 	var excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

// 	// 	// Create a Blob from the buffer and initiate the download
// 	// 	var blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
// 	// 	var fileName = 'Support_Report.xlsx';

// 	// 	if (typeof window.navigator.msSaveBlob !== 'undefined') {
// 	// 		// For IE browser
// 	// 		window.navigator.msSaveBlob(blob, fileName);
// 	// 	} else {
// 	// 		// For other browsers
// 	// 		var downloadLink = document.createElement('a');
// 	// 		downloadLink.href = window.URL.createObjectURL(blob);
// 	// 		downloadLink.download = fileName;
// 	// 		document.body.appendChild(downloadLink);
// 	// 		downloadLink.click();
// 	// 		document.body.removeChild(downloadLink);
// 	// 	}
// 	// }
// 	// Add a button click event to trigger Excel download
// 	downloadButton.click(function() {
// 		var filters = {
// 			project: project_filter.get_value(),
// 			name: name_filter.get_value(),
// 			module: module_filter.get_value(),
// 			from_date: from_date_filter.get_value(),
// 			to_date: to_date_filter.get_value(),
// 			task_type: task_type_filter.get_value()
// 		};

// 		// Call the server-side Python function to generate Excel
// 		frappe.call({
// 			method: "frappe.support_application.doctype.support_exp.support_exp.generate_excel",
// 			args: { filters: filters },
// 			callback: function(response) {
// 				// Initiate download of the generated Excel file
// 				var excelData = atob(response.message);

// // Create a Blob from the decoded data and initiate the download
// 				var blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
// 				var fileName = 'Support_Report.xlsx';

// 				var downloadLink = document.createElement('a');
// 				downloadLink.href = window.URL.createObjectURL(blob);
// 				downloadLink.download = fileName;
// 				document.body.appendChild(downloadLink);
// 				downloadLink.click();
// 				document.body.removeChild(downloadLink);
// 			}
// 		});
// 	});
	

	

//     // Append CSS styling
//     $('<style>')
//         .prop('type', 'text/css')
//         .html(`
//         /* [REST OF YOUR CSS HERE] */
        
//         /*//////////////////////////////////////////////////////////////////
//         [ Table ]*/
        
//         .limiter {
//             width: 100%;
//             margin: 0 auto;
//         }
        
//         .container-table100 {
//             width: 100%;
//             min-height: 100vh;
//             background: #d1d1d1;
//             display: -webkit-box;
//             display: -webkit-flex;
//             display: -moz-box;
//             display: -ms-flexbox;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             flex-wrap: wrap;
//             padding: 33px 30px;
            
			
//         }
        
//         .wrap-table100 {
//             width: 1300px;
//         }
        
//         .scrollable-table {
//             height: 900px;
//             overflow: auto;
//             width: 90%;
//             margin-left: 93px;
//         }
//         /*==================================================================
//         [ Ver1 ]*/
        
//         .table100.ver1 td {
//             font-family: Montserrat-Regular;
//             font-size: 14px;
//             color: #808080;
//             line-height: 1.4;
//         }
        
//         .table100.ver1 th {
//             font-family: Montserrat-Medium;
//             font-size: 12px;
//             color: #fff;
//             line-height: 1.4;
//             text-transform: uppercase;
//             background-color: #36304a;
//         }
        
//         .table100.ver1 .row100:hover {
//             background-color: #f2f2f2;
//         }
        
//         .table100.ver1 .hov-column-ver1 {
//             background-color: #f2f2f2;
//         }
        
//         .table100.ver1 .hov-column-head-ver1 {
//             background-color: #484848;
//         }
        
//         .table100.ver1 .row100 td:hover {
//             background-color: #6c7ae0;
//             color: #fff;
//         }
//         table {
//             width: 100%;
//             background-color: #fff;
//         }
        
//         th, td {
//             font-weight: unset;
//             padding-right: 10px;
//         }
        
//         .column100 {
//             width: 130px;
//             padding-left: 10px;
//         }
        
//         .column100.column1 {
//             width: 265px;
//             padding-left: 42px;
//         }
        
//         .row100.head th {
//             padding-top: 24px;
//             padding-bottom: 20px;
//         }
        
//         .row100 td {
//             padding-top: 18px;
//             padding-bottom: 14px;
//         }

//         /* Make the table header sticky */
//         .table100.ver1 thead {
//             position: sticky;
//             top: 0;
//             z-index: 2;
//         }
//         /* [Rest of your CSS here] */`)
//         .appendTo('head');
// };

// // Include the xlsx library script
// var scriptTag = document.createElement('script');
// scriptTag.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.2/xlsx.full.min.js';
// document.head.appendChild(scriptTag);

