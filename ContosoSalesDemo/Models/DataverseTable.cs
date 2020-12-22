// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Models
{
	using Newtonsoft.Json;
	using Newtonsoft.Json.Converters;
	using Newtonsoft.Json.Linq;
	using System.Globalization;

	public partial class DataverseTable
	{
		[JsonProperty("crcb2_baseid", Required = Required.Default, NullValueHandling = NullValueHandling.Ignore)]	// The property is not required, Ignore null values when serializing and deserializing objects
		public string Baseid { get; set; }

		[JsonProperty("crcb2_islatest", Required = Required.Default, NullValueHandling = NullValueHandling.Ignore)]
		public string Islatest { get; set; }
	}

	public partial class DataverseGetResponse
	{
		[JsonProperty("value", Required = Required.Always, NullValueHandling = NullValueHandling.Ignore)]	// The property is not required, Ignore null values when serializing and deserializing objects
		public JArray Values { get; set; }
	}

	public partial class Activities : DataverseTable
	{
		// Lookup column
		[JsonProperty("crcb2_LeadId@odata.bind", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string Leadid { get; set; }

		// Lookup column
		[JsonProperty("ownerid@odata.bind", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string Owner { get; set; }

		// Id column
		[JsonProperty(Constant.TableIdColumnActivities, Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string Id { get; set; }

		[JsonProperty("crcb2_activitytype", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public int? Activitytype { get; set; }

		[JsonProperty("crcb2_subject", Required = Required.Default, NullValueHandling = NullValueHandling.Ignore)]
		public string Subject { get; set; }

		[JsonProperty("crcb2_priority", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public int? Priority { get; set; }

		[JsonProperty("crcb2_startdatetime", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string Startdatetime { get; set; }

		[JsonProperty("crcb2_enddatetime", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string Enddatetime { get; set; }

		[JsonProperty("crcb2_duedatetime", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string Duedate { get; set; }

		[JsonProperty("crcb2_description", Required = Required.Default, NullValueHandling = NullValueHandling.Ignore)]
		public string Description { get; set; }

		[JsonProperty("crcb2_topic", Required = Required.Default, NullValueHandling = NullValueHandling.Ignore)]
		public string Topic { get; set; }

		[JsonProperty(Constant.RowCreationDateColumnName, Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string RowCreationDate { get; set; }
	}

	public partial class Opportunities : DataverseTable
	{
		// Lookup column
		[JsonProperty("originatingleadid@odata.bind", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string OriginatingLead { get; set; }

		// Lookup column
		[JsonProperty("ownerid@odata.bind", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string OwningUser { get; set; }

		// Id column
		[JsonProperty(Constant.TableIdColumnOpportunities, Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string Id { get; set; }

		[JsonProperty("name", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string Topic { get; set; }

		[JsonProperty("estimatedvalue", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public double? EstimatedRevenue { get; set; }

		[JsonProperty("estimatedclosedate", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string Estimatedclosedate { get; set; }

		[JsonProperty("crcb2_opportunitystatus", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public int? Status { get; set; }

		[JsonProperty("crcb2_salesstage", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public int? Salesstage { get; set; }

		[JsonProperty("crcb2_quoteamount", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public double? QuoteAmount { get; set; }

		[JsonProperty("actualvalue", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public double? Actualvalue { get; set; }

		[JsonProperty("actualclosedate", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string Closuredate { get; set; }

		[JsonProperty("crcb2_createdon", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string RowCreationDate { get; set; }

		// Lookup column (temp)
		[JsonProperty("parentaccountid@odata.bind", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string ParentAccountforlead { get; set; }

		// Lookup column (temp)
		[JsonProperty("parentcontactid@odata.bind", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string ParentContactforLead { get; set; }
	}

	public partial class Leads : DataverseTable
	{
		// parentaccountid alternative
		[JsonProperty("parentaccountname", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string ParentAccountName { get; set; }

		// Lookup column
		[JsonProperty("parentaccountid@odata.bind", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string ParentAccountforlead { get; set; }

		// Lookup column
		[JsonProperty("ownerid@odata.bind", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string SalespersonId { get; set; }

		// Id column
		[JsonProperty(Constant.TableIdColumnLeads, Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string Id { get; set; }

		[JsonProperty("crcb2_primarycontactname", Required = Required.Default, NullValueHandling = NullValueHandling.Ignore)]
		public string ContactName { get; set; }

		[JsonProperty("subject", Required = Required.Default, NullValueHandling = NullValueHandling.Ignore)]
		public string Topic { get; set; }

		[JsonProperty("leadqualitycode", Required = Required.Default, NullValueHandling = NullValueHandling.Ignore)]
		public int? Rating { get; set; }

		[JsonProperty("leadsourcecode", Required = Required.Default, NullValueHandling = NullValueHandling.Ignore)]
		public int? Source { get; set; }

		[JsonProperty("crcb2_leadstatus", Required = Required.Default, NullValueHandling = NullValueHandling.Ignore)]
		public int? LeadStatus { get; set; }

		[JsonProperty("crcb2_createdon", Required = Required.DisallowNull, NullValueHandling = NullValueHandling.Ignore)]
		public string RowCreationDate { get; set; }
	}

	public partial class Accounts
	{
		[JsonProperty(Constant.TableIdColumnAccounts, Required = Required.Always, NullValueHandling = NullValueHandling.Ignore)]
		public string Id { get; set; }

		[JsonProperty(Constant.RowCreationDateColumnName, Required = Required.Default, NullValueHandling = NullValueHandling.Ignore)]
		public string RowCreationDate { get; set; }
	}

	public partial class DataverseTable
	{
		public static DataverseTable FromJson(string json) => JsonConvert.DeserializeObject<DataverseTable>(json, ContosoSalesDemo.Models.Converter.Settings);
	}
	public partial class Activities
	{
		public new static Activities FromJson(string json) => JsonConvert.DeserializeObject<Activities>(json, ContosoSalesDemo.Models.Converter.Settings);
	}
	public partial class Opportunities
	{
		public new static Opportunities FromJson(string json) => JsonConvert.DeserializeObject<Opportunities>(json, ContosoSalesDemo.Models.Converter.Settings);
	}
	public partial class Leads
	{
		public new static Leads FromJson(string json) => JsonConvert.DeserializeObject<Leads>(json, ContosoSalesDemo.Models.Converter.Settings);
	}

	public partial class DataverseGetResponse
	{
		public static DataverseGetResponse FromJson(string json) => JsonConvert.DeserializeObject<DataverseGetResponse>(json, ContosoSalesDemo.Models.Converter.Settings);
	}

	public partial class Accounts
	{
		public static Accounts FromJson(string json) => JsonConvert.DeserializeObject<Accounts>(json, ContosoSalesDemo.Models.Converter.Settings);
	}

	internal static class Converter
	{
		public static readonly JsonSerializerSettings Settings = new JsonSerializerSettings
		{
			MetadataPropertyHandling = MetadataPropertyHandling.Ignore,
			DateParseHandling = DateParseHandling.None,
			Converters =
			{
				new IsoDateTimeConverter { DateTimeStyles = DateTimeStyles.AssumeUniversal }
			},
		};
	}
}
