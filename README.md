*ContosoSalesDemo* is an application based on Power BI [embedded analytics]( https://docs.microsoft.com/power-bi/developer/embedded/), demonstrating a sales management portal. The application empowers salespeople and sale managers to make business decisions based on data. Salespeople can monitor and track sales, leads, opportunities and accounts, and manage their calendars. Sale managers can view a summary of the salesforce performance, including sales history and individual accounts. The application also enables managers to provide salespeople with data driven insights, assisting them with their decision making.



## Embedded analytics features

This section lists the embedded analytics features demonstrated by the *ContosoSalesDemo* application.



### UI features

Users can do the following in the application’s user interface:

* Show/hide visuals.

* Change the layout of report visuals.

* Enable or disable Q&A support in the report.

* Apply custom themes to the embedded report, during runtime.



### Functionality

*ContosoSalesDemo*  functionalities based on embedded analytics:

* Exporting reports to PDF, PPT and PNG formats.

* Showing edit options in the visual context menu.

* Binding custom actions to button clicks.

* Editing (insert/update) data in a table using writeback operations. In the *ContosoSalesDemo* application you can add data to a database directly from the UI.

* Service Principal based authentication. This authentication method is recommended for accessing Power BI and [Common Data Service](https://docs.microsoft.com/powerapps/maker/common-data-service/data-platform-intro) REST APIs.



### Integration

*ContosoSalesDemo*  integration with other Microsoft databases and libraries:

* Common Data Service. The application’s  integration can be extended to other databases.

* [Microsoft.Identity.Web](https://github.com/AzureAD/microsoft-identity-web/), used for service principal authentication.



## Prerequisites


### Cloud resources

|Azure|Power BI|CDS|
|-----|--------|---|
|[App Service](https://azure.microsoft.com/en-in/services/app-service/) for hosting the application <br /><br /> [Key Vault](https://azure.microsoft.com/en-in/services/key-vault/) for storing certificates/secrets <br /><br /> [Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/what-is-application-management) app for creating [Service Principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals) object <br /><br /> [API Management](https://azure.microsoft.com/en-in/services/api-management/) for configuring API throttling|[Power BI Service license](https://powerbi.microsoft.com/en-us/pricing/) for hosting report <br /><br /> [Power BI Embedded capacity](https://azure.microsoft.com/en-in/pricing/details/power-bi-embedded/) for embedding report|[Dynamics 365 license](https://dynamics.microsoft.com/en-in/pricing/) for using CDS as data source|



## Architecture

![Architecture](WarehouseDemo/ClientApp/src/assets/Images/architecture.png)



### Software Dependencies

|Client-side|Server-side|
|-----------|-----------|
|[React](https://reactjs.org/) <br /> [TypeScript](https://www.typescriptlang.org/docs/)|[.NET 5](https://dotnet.microsoft.com/download/dotnet/5.0)|



### SDK/ API references

|Power BI|CDS|
|--------|---|
|[Power BI SDK](https://github.com/microsoft/PowerBI-CSharp)|[Create entity](https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/webapi/create-entity-web-api) <br /> [Update entity](https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/webapi/update-delete-entities-using-web-api)|



### Browser support

* Microsoft Edge Chromium

* Google Chrome



## Contributing

This project welcomes contributions and suggestions. Most contributions require you to
agree to a Contributor License Agreement (CLA) declaring that you have the right to,
and actually do, grant us the rights to use your contribution. For details, visit
https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need
to provide a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the
instructions provided by the bot. You will only need to do this once across all repositories using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/)
or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.



## License
This project is licensed under the MIT license - see [LICENSE](./LICENSE.txt)
