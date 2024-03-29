frappe.ready(() => {
	if ($(".assignment-text").length) {
		frappe.require("controls.bundle.js", () => {
			make_text_editor();
		});
	}

	$(".btn-upload").click((e) => {
		upload_file(e);
	});

	$(".btn-save-assignment").click((e) => {
		save_assignment(e);
	});

	$(".btn-close").click((e) => {
		clear_preview(e);
	});
});

const upload_file = (e) => {
	let type = $(e.currentTarget).data("type");
	let mapper = {
		Image: ["image/*"],
		Document: [
			".doc",
			".docx",
			".xml",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		],
		PDF: [".pdf"],
	};

	new frappe.ui.FileUploader({
		disable_file_browser: true,
		folder: "Home/Attachments",
		make_attachments_public: true,
		restrictions: {
			allowed_file_types: mapper[type],
		},
		on_success: (file_doc) => {
			$(e.currentTarget).addClass("hide");
			$("#assignment-preview").removeClass("hide");
			$("#assignment-preview .btn-close").removeClass("hide");
			$("#assignment-preview a").attr(
				"href",
				encodeURI(file_doc.file_url)
			);
			$("#assignment-preview a").text(file_doc.file_url);
		},
	});
};

const save_assignment = (e) => {
	let data = $(e.currentTarget).data("type");
	let answer,
		file = "";

	if (data == "URL") {
		answer = $(".assignment-answer").val();
		if (!answer) {
			frappe.throw({
				title: __("No Submission"),
				message: __("Please enter a response."),
			});
		}
	} else if (data == "Text") {
		answer = this.text_editor.get_value("assignment_text");
		if (!answer) {
			frappe.throw({
				title: __("No Submission"),
				message: __("Please enter a response."),
			});
		}
	} else if (data == "Number") {
        answer = $(".assignment-answer").val();
        if (!answer) {
            frappe.throw({
                title: __("No Submission"),
                message: __("Please enter a number."),
            });
        }
	} else {
		file = $("#assignment-preview a").attr("href");
		if (!file) {
			frappe.throw({
				title: __("No File"),
				message: __("Please upload a file."),
			});
		}
	}

	frappe.call({
		method: "lms.lms.doctype.lms_assignment_submission.lms_assignment_submission.upload_assignment",
		args: {
			assignment: $(e.currentTarget).data("assignment"),
			submission: $(e.currentTarget).data("submission") || "",
			assignment_attachment: file,
			answer: answer,
			status: $("#status").val(),
			comments: $("#comments").val(),
		},
		callback: (data) => {
			frappe.show_alert({
				message: __("Saved"),
				indicator: "green",
			});
			setTimeout(() => {
				window.location.href = `/assignment-submission/${$(
					e.currentTarget
				).data("assignment")}/${data.message}`;
			}, 2000);
		},
	});
};

const clear_preview = (e) => {
	$(".btn-upload").removeClass("hide");
	$("#assignment-preview").addClass("hide");
	$("#assignment-preview a").attr("href", "");
	$("#assignment-preview .btn-close").addClass("hide");
};

const make_text_editor = () => {
	this.text_editor = new frappe.ui.FieldGroup({
		fields: [
			{
				fieldname: "assignment_text",
				fieldtype: "Text Editor",
				default: $(".assignment-text-data").html(),
			},
		],
		body: $(".assignment-text").get(0),
	});
	this.text_editor.make();
	$(".assignment-text .form-section:last").removeClass("empty-section");
	$(".assignment-text .frappe-control").removeClass("hide-control");
	$(".assignment-text .form-column").addClass("p-0");
};
