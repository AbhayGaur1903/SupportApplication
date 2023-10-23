//filter on manager in child table
frappe.ui.form.on('Project EXP', {
	refresh: function(frm) {
		frm.set_query("manager", "manager", () => {
			return {
				filters: {
					is_manager: 1,
				}
			};
		});

	}
});


frappe.ui.form.on('Project EXP', {
	project_full_name: function(frm) {

		frm.save();
	}
});

