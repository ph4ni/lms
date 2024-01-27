# Copyright (c) 2023, Frappe and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class HoursSubmission(Document):
	def before_save(self):
		if self.validated_hours==None:
			self.validated_hours = self.hours_worked