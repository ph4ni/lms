# Copyright (c) 2024, Frappe and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from lms.lms.utils import add_volunteer_to_activity_after_approval,add_cood_perms_for_volunteer,add_mang_perms_for_volunteer

class VolunteerMapping(Document):
	def on_update(self):
		if self.status == "Accepted":
			#print(self.activity)
			if self.coordinator:
				add_cood_perms_for_volunteer(self.coordinator,self.volunteer)
			if self.manager:
				add_mang_perms_for_volunteer(self.manager,self.volunteer)
			add_volunteer_to_activity_after_approval(self.activity,self.volunteer)
			#self.send_mail()

	def send_mail(self):
		subject = _("You have joined the volunteering activity!")
		template = "batch_confirmation"
		custom_template = frappe.db.get_single_value(
			"LMS Settings", "batch_confirmation_template"
		)

		args = {
			"student_name": self.volunteer_name,
			"title": self.activity_name,
			"name": self.activity,
		}

		if custom_template:
			email_template = get_email_template(custom_template, args)
			subject = email_template.get("subject")
			content = email_template.get("message")

		frappe.sendmail(
			recipients=self.volunteer,
			subject=subject,
			template=template if not custom_template else None,
			content=content if custom_template else None,
			args=args,
			header=[subject, "green"],
			retry=3,
		)