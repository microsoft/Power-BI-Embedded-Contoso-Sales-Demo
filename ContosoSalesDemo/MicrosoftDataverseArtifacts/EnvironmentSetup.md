## Step 1: Log into [Power Apps](https://make.powerapps.com/) portal

## Step 2: Environment creation

Create a new Environment from the [Admin Center](https://admin.powerplatform.microsoft.com/) with below configuration

#### **Environment Settings:**

&nbsp;&nbsp;**Name:** <_Name of Environment, ex. ContosoSalesDemo_>

&nbsp;&nbsp;**Type:** Production

&nbsp;&nbsp;**Region:** United States

&nbsp;&nbsp;**Purpose:** Provide database support for the <Name of Application, ex. ContosoSalesDemo> Application

&nbsp;&nbsp;**Create a database for this environment:** Yes

**Click** `Next`

#### **Database Settings:**

&nbsp;&nbsp;**Language:** English

&nbsp;&nbsp;**URL:** <Choose URL as per your preference, ex. ContosoSalesDemoOrg.crm.dynamics.com>

&nbsp;&nbsp;**Currency:** USD ($)

&nbsp;&nbsp;**Enable Dynamics 365 apps:** Yes

&nbsp;&nbsp;**Automatically Deploy these Apps:** 
Choose the below apps

&nbsp;&nbsp;&nbsp;&nbsp;1. Customer Service

&nbsp;&nbsp;&nbsp;&nbsp;2. Field Service

&nbsp;&nbsp;&nbsp;&nbsp;3. Sales Enterprise

&nbsp;&nbsp;**Deploy Sample Apps and Data:** No

&nbsp;&nbsp;**Security Group:** None Selected

**Click** `Save`

**Note:** It will take ~5 minutes for the environment to be created. Click the `Refresh` button to confirm that the new environment is created.

## Step 3: Enable TDS Endpoint for the new environment

1. Go the created environment

2. Go to `Settings` by clicking on the top navigation pane

3. Click on the dropdown to the left of `Product` settings

4. Go to `Features` settings

5. Enable TDS Endpoint

6. Click `Save`

## Step 4: Configure the environment prefix

1. Go to [Power Apps](https://make.powerapps.com/) portal home

2. From the `Environments`, select the created environment

3. From the `Settings` gear icon, select `Advanced Settings` of the environment

4. From the `Settings` dropdown in the navigation panel, select `Customizations`

5. Select `Publishers`

6. Select `CDS Default Publisher`

7. In the opened window, go to "Set the prefix name for custom entities and fields" section

8. Change the Prefix to `crcb2`

9. Click `Save and Close`