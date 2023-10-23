

frappe.listview_settings['Weekly Project Status EXP'] = {
    // onload: function(listview) {

    //     // Create the custom button using jQuery
    //     let custom_button = $(`<button class="btn btn-primary btn-sm primary-action" data-label="View%20Weekly%20Summary%20Report">
    //                               <span class="alt-underline">V</span>iew Weekly Summary Report
    //                            </button>`);

    //     // Attach click event to the custom button
    //     custom_button.click(function() {
    //         frappe.set_route('weekly-summary-repor');
    //     });
    //     if (listview.page) {
    //         listview.page.set_secondary_action(custom_button.text(), function() {
    //             custom_button.click();
    //         });
    //     }
    // },
    // refresh: function(listview) {
    //     // Use the provided CSS selector to target each row
    //     const rows = document.querySelectorAll("#page-List\\/Weekly\\ Project\\ Status\\ EXP\\/List > div.container.page-body > div.page-wrapper > div > div.row.layout-main > div.col.layout-main-section-wrapper > div.layout-main-section.frappe-card > div.frappe-list > div.result > div.list-row-container");
        
    //     rows.forEach(row => {
    //         // Retrieve week_start_date and project values from the row
    //         let weekStartDateString = row.querySelector('div.level-left.ellipsis > div:nth-child(5) > span > a').textContent.trim();
    //         let projectValue = row.querySelector('div.level-left.ellipsis > div:nth-child(3) > span').textContent.trim();
    
    //         // Convert weekStartDateString to a Date object and add 7 days to get week_end_date
            

    //         // Convert the string to a date object
    //         let weekStartDate = customStrToObj(weekStartDateString);

    //         // Add 7 days for the end date
    //         let weekEndDate = new Date(weekStartDate);
    //         weekEndDate.setDate(weekStartDate.getDate() + 7);

    //         // Convert the date object back to a string
    //         let weekEndDateString = convertToStandardDate(weekEndDate);
    //         let weekStartDateString_ = convertToStandardDate(weekStartDate);

    //         // Create the button for the row
    //         let row_button = document.createElement('button');
    //         row_button.className = "btn btn-secondary btn-default btn-sm";
    //         row_button.style.marginLeft = "-100px";
    //         row_button.textContent = "Go to Summary";
    //         console.log(weekEndDateString);
    //         console.log(convertToStandardDate(weekStartDate));
    //         console.log(projectValue);
    //         row_button.onclick = function(event) {
    //             event.stopPropagation();
    //             frappe.set_route('weekly-summary-repor', { 
    //                 weekStartDate: weekStartDateString_, 
    //                 weekEndDate: weekEndDateString,
    //                 project: projectValue 
    //             });
    //         };
    
    //         // Append the button to the row
    //         row.querySelector('.level-right').appendChild(row_button);
    //     });
    // }
    // refresh: function(listview) {
    //     const rows = document.querySelectorAll("#page-List\\/Weekly\\ Project\\ Status\\ EXP\\/List > div.container.page-body > div.page-wrapper > div > div.row.layout-main > div.col.layout-main-section-wrapper > div.layout-main-section.frappe-card > div.frappe-list > div.result > div.list-row-container");
        
    //     rows.forEach(row => {
    //         // Create the button for the row
    //         let row_button = document.createElement('button');
    //         row_button.className = "btn btn-secondary btn-default btn-sm";
    //         row_button.style.marginLeft = "-100px";
    //         row_button.textContent = "Go to Summary";

    //         row_button.onclick = function(event) {
    //             event.stopPropagation();
                
    //             // Retrieve week_start_date and project values from the row
    //             let weekStartDateString = row.querySelector('div.level-left.ellipsis > div:nth-child(5) > span > a').textContent.trim();
    //             let projectValue = row.querySelector('div.level-left.ellipsis > div:nth-child(3) > span').textContent.trim();
                
    //             // Convert weekStartDateString to a Date object and add 7 days to get week_end_date
    //             let weekStartDate = customStrToObj(weekStartDateString);
    //             let weekEndDate = new Date(weekStartDate);
    //             weekEndDate.setDate(weekStartDate.getDate() + 7);
                
    //             // Convert the date objects back to strings
    //             let weekEndDateString = convertToStandardDate(weekEndDate);
    //             let weekStartDateString_ = convertToStandardDate(weekStartDate);

    //             console.log(weekEndDateString);
    //             console.log(convertToStandardDate(weekStartDateString_));
    //             console.log(projectValue);
                
    //             // Set the route with the retrieved values
    //             frappe.set_route('weekly-summary-repor', { 
    //                 weekStartDate: weekStartDateString_, 
    //                 weekEndDate: weekEndDateString,
    //                 project: projectValue 
    //             });
    //         };
    
    //         // Append the button to the row
    //         row.querySelector('.level-right').appendChild(row_button);
    //     });
    // }
    refresh: function(listview) {
        $("head").append('<style>.btn.btn-secondary.btn-default.btn-sm { background-color: wheat; }</style>');

        const rows = document.querySelectorAll("#page-List\\/Weekly\\ Project\\ Status\\ EXP\\/List > div.container.page-body > div.page-wrapper > div > div.row.layout-main > div.col.layout-main-section-wrapper > div.layout-main-section.frappe-card > div.frappe-list > div.result > div.list-row-container");
        
        rows.forEach(row => {
            // Create the anchor for the row
            let row_anchor = document.createElement('a');
            row_anchor.className = "btn btn-secondary btn-default btn-sm";
            row_anchor.style.marginLeft = "-100px";
            row_anchor.textContent = "Go to Report";

            // Set the href when the link is clicked
            row_anchor.onclick = function(event) {
                event.stopPropagation();
                
                // Retrieve week_start_date and project values from the row
                let weekStartDateString = row.querySelector('div.level-left.ellipsis > div:nth-child(5) > span > a').textContent.trim();
                let projectValue = row.querySelector('div.level-left.ellipsis > div:nth-child(3) > span').textContent.trim();
                
                // Convert weekStartDateString to a Date object and add 7 days to get week_end_date
                let weekStartDate = customStrToObj(weekStartDateString);
                let weekEndDate = new Date(weekStartDate);
                weekEndDate.setDate(weekStartDate.getDate() + 7);
                
                // Convert the date objects back to strings
                let weekEndDateString = convertToStandardDate(weekEndDate);
                let weekStartDateString_ = convertToStandardDate(weekStartDate);
                
                // Construct the href with the route and parameters
                row_anchor.href = `/app/weekly-summary-repor?weekStartDate=${weekStartDateString_}&weekEndDate=${weekEndDateString}&project=${encodeURIComponent(projectValue)}`;
            };
    
            // Append the anchor to the row
            row.querySelector('.level-right').appendChild(row_anchor);
        });
    }
};



function customStrToObj(dateString) {
    let parts = dateString.split('-');
    return new Date(parts[2], parts[1] - 1, parts[0]); // month is 0-indexed
}


function convertToStandardDate(timestamp) {
    // Create a new Date object using the provided timestamp
    let date = new Date(timestamp);
    
    // Extract year, month, and day from the Date object
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');  // Months are 0-indexed in JavaScript
    let day = date.getDate().toString().padStart(2, '0');
    
    // Combine year, month, and day to get the desired format
    return `${year}-${month}-${day}`;
}