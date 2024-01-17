# Copyright (c) 2024, Frappe and contributors
# For license information, please see license.txt

# import frappe
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
		

