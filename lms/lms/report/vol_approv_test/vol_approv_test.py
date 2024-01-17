# Copyright (c) 2024, Frappe and contributors
# For license information, please see license.txt

import frappe
'''

def execute(filters=None):
	columns, data = [], []
	return columns, data
'''
from frappe import _

def execute(filters=None):
    columns = [
        {"label": _("Volunteer Name"), "fieldname": "volunteer_name", "fieldtype": "Link", "options": "User"},
        {"label": _("Validated Hours"), "fieldname": "validated_hours", "fieldtype": "Float"},
    ]

    data = get_data(filters)

    return columns, data

def get_data(filters):
    # Write your SQL query to fetch data from the "Hours Submission" table
    sql_query = """
        SELECT
            volunteer_name,
            validated_hours
        FROM
            `tabHours Submission`
    """

    # Execute the query
    data = frappe.db.sql(sql_query, as_dict=True)

    return data
