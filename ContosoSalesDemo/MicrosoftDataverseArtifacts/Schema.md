**SCHEMA**

**Custom "Choice" Columns' Values**

| **Table** | **Opportunity** | **Opportunity** | **Activity** | **Activity** | **Lead** | **Lead** |
| --- | --- | --- | --- | --- | --- | --- |
| **Choice Columns** | **Opportunity Sales Stage** | **Opportunity Status** | **Activity Type** | **Priority** | **Lead Status** | **Rating** |
| **Values** | Qualify | Closed Won | Appointment | Low | New | Hot |
|   | Closed | Closed Lost | Email | Normal | Qualified | Warm |
|   | Develop | Quote Sent | Phone Call | High | Disqualified | Cold |
|   | Propose | Meeting Scheduled | Task |   |   |   |
|   |   | New |   |   |   |   |

**Table Definitions**

**Note:** The tables in the environment would have additional columns as compared to the below list. Please validate if the below columns are present in the tables. All other additional columns can be ignored.<br/>

| **Table Display Name** | **User** |   |   |
| --- | --- | --- | --- |
| **Table Database Name** | **systemuser** |   |   |
| **Custom Table** | **No** |   |   |
| **Column Display Name** | User | Full Name | Manager |
| **Column Database Name** | systemuserid | fullname | parentsystemuserid |
| **Type** | Unique Identifier | Text | Lookup |



| **Table Display Name** | **Account** |   |   |   |   |   |   |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Table Database Name** | **account** |   |   |   |   |   |   |   |   |   |   |
| **Custom Table** | **No** |   |   |   |   |   |   |   |   |   |   |
| **Column Display Name** | Account | Account name | Primary Contact Name | Row Creation Date | Address 1: Country/Region | Address 1: City | Email | Industry | Main Phone | Owner | Owning User |
| **Column Database Name** | accountid | name | crcb2\_primarycontactname | crcb2\_rowcreationdate | address1\_country | address1\_city | emailaddress1 | industrycode | telephone1 | ownerid | owninguser |
| **Type** | Unique Identifier | Text | Text | Date Only | Text | Text | Email | Choice | Phone | Owner | Lookup |
| **Relationship** |   |   |   |   |   |   |   |   |   |   | user.systemuserid |
| **Custom column** |   |   | Yes | Yes |   |   |   |   |   |   |   |

| **Table Display Name** | **Lead** |   |   |   |   |   |   |   |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Table Database Name** | **lead** |   |   |   |   |   |   |   |   |   |   |   |
| **Custom Table** | **No** |   |   |   |   |   |   |   |   |   |   |   |
| **Column Display Name** | Lead | Base Id | Is Latest | Row Creation Date | Topic | Contact Name | Lead Status | Rating | Lead Source | Parent Account for lead | Owner | Owning User |
| **Column Database Name** | leadid | crcb2\_baseid | crcb2\_islatest | crcb2\_createdon | subject | crcb2\_primarycontactname | crcb2\_leadstatus | leadqualitycode | leadsourcecode | parentaccountid | ownerid | owninguser |
| **Type** | Unique Identifier | Text | Text | Date Only | Text | Text | Choice | Choice | Choice | Lookup | Owner | Lookup |
| **Relationship** |   |   |   |   |   |   |   |   |   | account.accountid |   | user.systemuserid |

| **Table Display Name** | **Opportunity** |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Table Database Name** | **opportunity** |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| **Custom Table** | **No** |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| **Column Display Name** | Opportunity | Base Id | Originating Lead | Account | Is Latest | Topic | Opportunity Status | Opportunity Sales Stage | Estimated Revenue | Quote Amount | Actual Revenue | Estimated Close Date | Actual Close Date | Row Creation Date | Owner | Owning User |
| **Column Database Name** | opportunityid | crcb2\_baseid | originatingleadid | parentaccountid | crcb2\_islatest | name | crcb2\_opportunitystatus | crcb2\_salesstage | estimatedvalue | crcb2\_quoteamount | actualvalue | estimatedclosedate | actualclosedate | crcb2\_createdon | ownerid | owninguser |
| **Type** | Unique Identifier | Text | Lookup | Lookup | Text | Text | Choice | Choice | Currency | Currency | Currency | Date Only | Date Only | Date Only | Owner | Lookup |
| **Relationship** |   |   | lead.leadid | account.accountid |   |   |   |   |   |   |   |   |   |   |   | user.systemuserid |

| **Table Display Name** | **Activity** |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Table Database Name** | **crcb2\_activity** |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| **Custom Table** | **Yes** |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| **Column Display Name** | **AutoGenKey** | Activity Id | Base Id | Lead Id | Is Latest | Subject | Topic | Description | Activity Type | Priority | Due Date | Start Date | End Date | Row Creation Date | Owner | Owning User |
| **Column Database Name** | **crcb2\_autogenkey** | crcb2\_activitiesid | crcb2\_baseid | crcb2\_leadid | crcb2\_islatest | crcb2\_subject | crcb2\_topic | crcb2\_description | crcb2\_activitytype | crcb2\_priority | crcb2\_duedatetime | crcb2\_startdatetime | crcb2\_enddatetime | crcb2\_rowcreationdate | ownerid | owninguser |
| **Type** | **Autonumber** | Unique Identifier | Text | Lookup | Text | Text | Text | Text | Choice | Choice | Date and Time | Date and Time | Date and Time | Date Only | Owner | Lookup |
| **Relationship** | **\*Primary Name Column** |   |   | lead.leadid |   |   |   |   |   |   |   |   |   |   |   | user.systemuserid |
| **Autonumber Type** | **String Prefixed Number** |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| **Prefix** | **act** |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| **Min Digits/ seed value** | **4/1000** |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |