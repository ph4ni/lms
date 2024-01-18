frappe.ready(() => {
	setup_file_size();
	pin_header();

	$(".enroll-in-course").click((e) => {
		enroll_in_course(e);
	});

	$(".enroll-in-batch").click((e) => {
		enroll_in_batch(e);
	});

	$(".add-to-mapping").click((e) => {
		add_to_mapping(e);
	});

	$(".notify-me").click((e) => {
		notify_user(e);
	});

	$(".nav-link").click((e) => {
		change_hash(e);
	});

	if (window.location.hash) {
		open_tab();
	}

	if (window.location.pathname == "/statistics") {
		generate_graph("New Signups", "#new-signups");
		generate_graph("Course Enrollments", "#course-enrollments");
		generate_graph("Lesson Completion", "#lesson-completion");
		generate_course_completion_graph();
	}

	expand_the_active_chapter();

	$(".chapter-title")
		.unbind()
		.click((e) => {
			rotate_chapter_icon(e);
		});

	$(".no-preview").click((e) => {
		show_no_preview_dialog(e);
	});

	$("#create-batch").click((e) => {
		open_batch_dialog(e);
	});

	$("#course-filter").change((e) => {
		filter_courses(e);
	});
});

const pin_header = () => {
	const el = document.querySelector(".sticky");
	if (el) {
		const observer = new IntersectionObserver(
			([e]) =>
				e.target.classList.toggle("is-pinned", e.intersectionRatio < 1),
			{ threshold: [1] }
		);
		observer.observe(el);
	}
};

const setup_file_size = () => {
	frappe.provide("frappe.form.formatters");
	frappe.form.formatters.FileSize = file_size;
};

const file_size = (value) => {
	if (value > 1048576) {
		value = flt(flt(value) / 1048576, 1) + "M";
	} else if (value > 1024) {
		value = flt(flt(value) / 1024, 1) + "K";
	}
	return value;
};

const enroll_in_course = (e) => {
	e.preventDefault();
	let course = $(e.currentTarget).attr("data-course");
	if (frappe.session.user == "Guest") {
		window.location.href = `/login?redirect-to=/courses/${course}`;
		return;
	}

	let batch = $(e.currentTarget).attr("data-batch");
	batch = batch ? decodeURIComponent(batch) : "";
	frappe.call({
		method: "lms.lms.doctype.lms_enrollment.lms_enrollment.create_membership",
		args: {
			batch: batch ? batch : "",
			course: course,
		},
		callback: (data) => {
			if (data.message == "OK") {
				$(".no-preview-modal").modal("hide");
				frappe.show_alert(
					{
						message: __("Enrolled successfully"),
						indicator: "green",
					},
					3
				);
				setTimeout(function () {
					window.location.href = `/courses/${course}/learn/1.1`;
				}, 1000);
			}
		},
	});
};
/*
const enroll_in_batch = (e) => {
	e.preventDefault();
	let batch = $(e.currentTarget).attr("data-batch");
	if (frappe.session.user == "Guest") {
		window.location.href = `/login?redirect-to=/batches/${batch}`;
		return;
	}
	
	batch = batch ? decodeURIComponent(batch) : "";
	frappe.call({
		method: "lms.lms.utils.add_student_to_batch_wop",
		args: {
			batchname: batch,
		},
		callback: (data) => {
			frappe.show_alert({
				message: __("Registered Successfully!"),
				indicator: "green",
			});
			setTimeout(() => {
				window.location.href = data.message;
			}, 1000);
		},
	});
};
*/

const enroll_in_batch = (e) => {
    e.preventDefault();
    let batch = $(e.currentTarget).attr("data-batch");

    if (frappe.session.user == "Guest") {
        window.location.href = `/login?redirect-to=/batches/${batch}`;
        return;
    }

    batch = batch ? decodeURIComponent(batch) : "";

    // Call the server-side function to get details
    frappe.call({
        method: "lms.lms.utils.get_extra_questions",
        args: {
            batch_name: batch,
        },
        callback: (data) => {
            const details = data.message;
            /*if (details.extrainfo) {
                // Show a dialog to collect additional information
                showExtraInfoDialog(details.question1, details.question2, (answer1, answer2) => {
                    // Call the method without additional information
                    callAddStudentToBatchMethod(batch, answer1, answer2);
                });
            } else {
                // Call the method without additional information
                callAddStudentToBatchMethod(batch);
            }*/
        },
    });
};


const add_to_mapping = (e) => {
    e.preventDefault();
    let batch = $(e.currentTarget).attr("data-batch");

    if (frappe.session.user == "Guest") {
        window.location.href = `/login?redirect-to=/batches/${batch}`;
        return;
    }

    batch = batch ? decodeURIComponent(batch) : "";

    // Call the server-side function to get details
    frappe.call({
        method: "lms.lms.utils.get_extra_questions",
        args: {
            batch_name: batch,
        },
        callback: (data) => {
            const details = data.message;
            if (details.extrainfo) {
                // Show a dialog to collect additional information
                showExtraInfoDialog(details.question1, details.question2, (answer1, answer2) => {
                    // Call the method without additional information
                    AddVolunteerToMapping(batch, answer1, answer2);
                });
            } else {
                // Call the method without additional information
                AddVolunteerToMapping(batch);
            }
        },
    });
};


const showExtraInfoDialog = (question1, question2, callback) => {
    let extraInfoDialog = new frappe.ui.Dialog({
        title: "Extra Information",
        fields: [
            {
                fieldtype: "Data",
                label: question1,
                fieldname: "answer_1",
            },
            {
                fieldtype: "Data",
                label: question2,
                fieldname: "answer_2",
            },
        ],
        primary_action_label: __("Submit"),
        primary_action(values) {
            extraInfoDialog.hide();
            callback(values.answer_1, values.answer_2);
        },
    });
    extraInfoDialog.show();
};

const AddVolunteerToMapping = (batch, answer1 = "", answer2 = "") => {
    frappe.call({
        method: "lms.lms.utils.add_volunteer_tomapping",
        args: {
            batchname: batch,
            answer1: answer1,
            answer2: answer2,
        },
        callback: (data) => {
            frappe.show_alert({
                message: __("Applied Successfully!"),
                indicator: "green",
            });
            setTimeout(() => {
                window.location.href = data.message;
            }, 1000);
        },
    });
};

const AddVolunteertoActivity = (batch) => {
    frappe.call({
        method: "lms.lms.utils.add_student_to_batch_wop",
        args: {
            batchname: batch,
        },
        callback: (data) => {
            frappe.show_alert({
                message: __("Registered Successfully!"),
                indicator: "green",
            });
            setTimeout(() => {
                window.location.href = data.message;
            }, 1000);
        },
    });
};




const notify_user = (e) => {
	e.preventDefault();
	var course = decodeURIComponent($("#outline-heading").attr("data-course"));
	if (frappe.session.user == "Guest") {
		window.location.href = `/login?redirect-to=/courses/${course}`;
		return;
	}

	frappe.call({
		method: "lms.lms.doctype.lms_course_interest.lms_course_interest.capture_interest",
		args: {
			course: course,
		},
		callback: (data) => {
			$(".no-preview-modal").modal("hide");
			frappe.show_alert(
				{
					message: __(
						"You have opted to be notified for this course. You will receive an email when the course becomes available."
					),
					indicator: "green",
				},
				3
			);
			setTimeout(() => {
				window.location.reload();
			}, 3000);
		},
	});
};

const generate_graph = (chart_name, element, type = "line") => {
	let date = frappe.datetime;

	frappe.call({
		method: "lms.lms.utils.get_chart_data",
		args: {
			chart_name: chart_name,
			timespan: "Select Date Range",
			timegrain: "Daily",
			from_date: date.add_days(date.get_today(), -30),
			to_date: date.add_days(date.get_today(), +1),
		},
		callback: (data) => {
			render_chart(data.message, chart_name, element, type);
		},
	});
};

const render_chart = (data, chart_name, element, type) => {
	const chart = new frappe.Chart(element, {
		title: chart_name,
		data: data,
		type: type,
		height: 250,
		colors: ["#4563f1"],
		axisOptions: {
			xIsSeries: 1,
		},
		lineOptions: {
			regionFill: 1,
		},
	});
};

const generate_course_completion_graph = () => {
	frappe.call({
		method: "lms.lms.utils.get_course_completion_data",
		callback: (data) => {
			render_chart(
				data.message,
				"Course Completion",
				"#course-completion",
				"pie"
			);
		},
	});
};

const change_hash = (e) => {
	window.location.hash = $(e.currentTarget).attr("href");
};

const open_tab = () => {
	$(`a[href="${window.location.hash}"]`).click();
};

const expand_the_first_chapter = () => {
	let elements = $(".course-home-outline .collapse");
	elements.each((i, element) => {
		if (i < 1) {
			show_section(element);
			return false;
		}
	});
};

const expand_the_active_chapter = () => {
	let selector = $(".course-home-headings.title");

	if (selector.length && $(".course-details-page").length) {
		expand_for_course_details(selector);
	} else if ($(".active-lesson").length) {
		/* For course home page */
		selector = $(".active-lesson");
		show_section(selector.parent().parent());
	} else {
		/* If no active chapter then exapand the first chapter */
		expand_the_first_chapter();
	}
};

const expand_for_course_details = (selector) => {
	$(".lesson-info").removeClass("active-lesson");
	$(".lesson-info").each((i, elem) => {
		if ($(elem).data("lesson") == selector.data("lesson")) {
			$(elem).addClass("active-lesson");
			show_section($(elem).parent().parent());
		}
	});
};

const show_section = (element) => {
	$(element).addClass("show");
	$(element)
		.siblings(".chapter-title")
		.children(".chapter-icon")
		.css("transform", "rotate(90deg)");
	$(element).siblings(".chapter-title").attr("aria-expanded", true);
};

const rotate_chapter_icon = (e) => {
	let icon = $(e.currentTarget).children(".chapter-icon");
	if (icon.css("transform") == "none") {
		icon.css("transform", "rotate(90deg)");
	} else {
		icon.css("transform", "none");
	}
};

const show_no_preview_dialog = (e) => {
	$("#no-preview-modal").modal("show");
};

const open_batch_dialog = () => {
	this.batch_dialog = new frappe.ui.Dialog({
		title: __("New Activity"),
		fields: [
			{
				fieldtype: "Data",
				label: __("Title"),
				fieldname: "title",
				reqd: 1,
				default: batch_info && batch_info.title,
			},
			{
				fieldtype: "Check",
				label: __("Published"),
				fieldname: "published",
				default: batch_info && batch_info.published,
			},
			{
				fieldtype: "Section Break",
			},
			{
				fieldtype: "Date",
				label: __("Start Date"),
				fieldname: "start_date",
				reqd: 1,
				default: batch_info && batch_info.start_date,
			},
			{
				fieldtype: "Column Break",
			},

			{
				fieldtype: "Date",
				label: __("End Date"),
				fieldname: "end_date",
				reqd: 1,
				default: batch_info && batch_info.end_date,
			},/*
			{
				fieldtype: "Section Break",
			},
			{
				fieldtype: "Select",
				label: __("Medium"),
				fieldname: "medium",
				options: ["Online", "Offline"],
				default: (batch_info && batch_info.medium) || "Online",
			},
			{
				fieldtype: "Link",
				label: __("Category"),
				fieldname: "category",
				options: "LMS Category",
				only_select: 1,
				default: batch_info && batch_info.category,
			},
			{
				fieldtype: "Column Break",
			},
			{
				fieldtype: "Int",
				label: __("Seat Count"),
				fieldname: "seat_count",
				default: batch_info && batch_info.seat_count,
			},
			{
				fieldtype: "Date",
				label: __("Evaluation End Date"),
				fieldname: "evaluation_end_date",
				default: batch_info && batch_info.evaluation_end_date,
			},*/
			{
				fieldtype: "Section Break",
			},
			{
				fieldtype: "Small Text",
				label: __("Short Description"),
				fieldname: "description",
				placeholder: "One or two lines short intro about the activity",
				default: batch_info && batch_info.description,
				reqd: 1,
			},
			{
				fieldtype: "Text Editor",
				label: __("Activity Details"),
				fieldname: "batch_details",
				placeholder: "Full details of the activity",
				default: batch_info && batch_info.batch_details,
				reqd: 1,
			},/*
			{
				fieldtype: "HTML Editor",
				label: __("Batch Details Raw"),
				fieldname: "batch_details_raw",
				default: batch_info && batch_info.batch_details_raw,
			},*/
            {
                fieldtype: "Check",
                label: __("Request extra info before signup?"),
                fieldname: "extrainfo",
                default: batch_info && batch_info.extrainfo,
            },
            {
                fieldtype: "Data",
                label: __("Question 1"),
                fieldname: "question1",
				placeholder: "Ex: Where did you hear about us?",
                depends_on: "eval:doc.extrainfo==1",
				default: batch_info && batch_info.question1,
            },
			{
                fieldtype: "Data",
                label: __("Question 2"),
                fieldname: "question2",
				placeholder: "optional",
                depends_on: "eval:doc.extrainfo==1",
				default: batch_info && batch_info.question2,
            },
			{
				fieldtype: "Section Break",
			},
			{
				fieldtype: "Attach Image",
				label: __("Activity Image or Poster"),
				fieldname: "meta_image",
				default: batch_info && batch_info.meta_image,
			},
			/*
			{
				fieldtype: "Section Break",
				label: __("Pricing"),
				fieldname: "pricing",
			},
			{
				fieldtype: "Check",
				label: __("Paid Batch"),
				fieldname: "paid_batch",
				default: batch_info && batch_info.paid_batch,
			},
			{
				fieldtype: "Currency",
				label: __("Amount"),
				fieldname: "amount",
				default: batch_info && batch_info.amount,
				mandatory_depends_on: "paid_batch",
				depends_on: "paid_batch",
			},
			{
				fieldtype: "Link",
				label: __("Currency"),
				fieldname: "currency",
				options: "Currency",
				default: batch_info && batch_info.currency,
				mandatory_depends_on: "paid_batch",
				depends_on: "paid_batch",
				only_select: 1,
			},*/
		],
		primary_action_label: __("Create Activity"),
		primary_action: (values) => {
			save_batch(values);
		},
	});
	this.batch_dialog.show();
};

const save_batch = (values) => {
	let args = {};
	if (batch_info) {
		args = Object.assign(batch_info, values);
	} else {
		args = values;
	}
	frappe.call({
		method: "lms.lms.doctype.lms_batch.lms_batch.create_batch",
		args: args,
		callback: (r) => {
			if (r.message) {
				frappe.show_alert({
					message: batch_info
						? __("Batch Updated")
						: __("Batch Created"),
					indicator: "green",
				});
				this.batch_dialog.hide();
				window.location.href = `/batches/details/${r.message.name}`;
			}
		},
	});
};

const filter_courses = (e) => {
	const course_lists = $(".course-cards-parent");
	const filter = $(e.currentTarget).val();
	course_lists.each((i, list) => {
		const course_cards = $(list).children(".course-card");
		course_cards.sort((a, b) => {
			var value1 = $(a).data(filter);
			var value2 = $(b).data(filter);
			return value1 > value2 ? -1 : value1 < value2 ? 1 : 0;
		});
		$(list).append(course_cards);
	});
};
