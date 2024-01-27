# Copyright (c) 2023, Frappe and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class HoursRequest(Document):
	def validate(self):
		self.validate_end_date()
	
	def validate_end_date(self):
		if(self.end_date < self.start_date):
			frappe.throw("End date cannot be before the Start date")