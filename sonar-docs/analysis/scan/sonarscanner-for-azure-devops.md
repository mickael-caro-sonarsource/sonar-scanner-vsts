---
title: SonarScanner for Azure DevOps
url: /analysis/scan/sonarscanner-for-azure-devops/
---


[[info]]
| By [SonarSource](https://www.sonarsource.com/) - GNU LGPL 3 - [Issue Tracker](https://jira.sonarsource.com/browse/VSTS) - [Source](https://github.com/SonarSource/sonar-scanner-vsts)  
| **SonarScanner for Azure DevOps**

[[info]]
| This page is about Azure DevOps Services, formerly known as VSTS.

You can connect to SonarCloud using your Azure DevOps account. On the [login page](/#sonarcloud#/sessions/new), just click on the "Log in with Azure DevOps" button.

[[warning]]
| ![Warning](/images/exclamation.svg) Only work and school Azure DevOps accounts are authorized to login on SonarCloud.

The <!-- sonarqube -->[SonarQube](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarqube)<!-- /sonarqube --> <!-- sonarcloud -->[SonarCloud](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarcloud)<!-- /sonarcloud --> extension for Azure DevOps <!-- sonarqube -->Server<!-- /sonarqube --> makes it easy to integrate analysis into your build pipeline. The extension allows the analysis of all languages supported by {instance}.

<!-- sonarcloud -->
Microsoft has published a [dedicated lab](https://aka.ms/sonarcloudlab) describing how to integrate SonarCloud in Azure DevOps pipelines. The lab includes setting up a Branch Policy in Azure DevOps to block a Pull Request from being submitted if the changed code does not meet the quality bar, as well as setting up the newest pre-deployement gate available from 1.8+ version of the extension.
<!-- /sonarcloud -->

<!-- sonarqube -->
## Compatibility
Version 4.x is compatible with:
* TFS 2017 Update 2+
* TFS 2018
* Azure DevOps Server 2019
<!-- /sonarqube -->

The extension embeds its own version of the [SonarScanner for MSBuild](/analysis/scan/sonarscanner-for-msbuild/).

## Installation
1. Install the extension [from the marketplace](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarcloud)

If you are using [Microsoft-hosted build agents](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/hosted?view=azure-devops) then there is nothing else to install. The extension will work with all of the hosted agents (Windows, Linux, and MacOS).

2. If you are self-hosting the build agents make sure at least the minimal version of Java supported by SonarCloud is installed.
In addition, make sure the appropriate build tools are installed on the agent for the type of project e.g. .NET Framework v4.6+/NET Core 2.0+ if building using MSBuild, Maven for Java projects etc.

## Configure
The first thing to do is to declare SonarCloud as a service endpoint in your Azure DevOps project settings. 

1. Open the Connections page in your Azure DevOps project: **Project Settings > Pipelines > Service Connections**.
2. Click on **New service connection** and choose **SonarCloud**.
3. Specify a **Connection name** and **SonarCloud token**. There is a link in the dialog that will take you to the account security page on SonarCloud where you can create a new token if necessary. There is also a button that lets you verify that connection is correctly configured.

Each extension provides three tasks you will use in your build pipeline to analyze your projects:

* **Prepare analysis on SonarCloud** task, to configure all the required settings before executing the build. 
   * This task is mandatory. 
   * In case of .NET solutions or Java projects, it helps to integrate seamlessly with MSBuild, Maven and Gradle tasks.
* **Run Code Analysis** task, to actually execute the analysis of the source code. 
   * This task is not required for Maven or Gradle projects, because scanner will be run as part of the Maven/Gradle build.
* **Publish Quality Gate Result** task, to display the Quality Gate status in the build summary and give you a sense of whether the application is ready for production "quality-wise". 
   * This task is required if you are using the SonarCloud quality gate status pre-deployment gate in a release pipeline, otherwise it is optional.
   * It can significantly increase the overall build time because it will poll SonarCloud until the analysis is complete. Omitting this task will not affect the analysis results on SonarCloud - it simply means the Azure DevOps Build Summary page will not show the status of the analysis or a link to the project dashboard on SonarCloud.
 
When creating a build pipeline you can filter the list of available tasks by typing "Sonar" to display only the relevant tasks.

## Analyzing a .NET solution
1. In your build definition, add:
   * At least **Prepare analysis on SonarCloud** task and **Run Code Analysis** task
   * Optionally **Publish Quality Gate Result** task
2. Reorder the tasks to respect the following order:
   * **Prepare analysis on SonarCloud** task before any **MSBuild** or **Visual Studio Build** tasks.
   * **Run Code Analysis** task after the **Visual Studio Test task**.
   * **Publish Quality Gate Result** task after the **Run Code Analysis** task
3. Click on the **Prepare analysis on SonarCloud** build step to configure it:
   * You must specify the service connection (i.e. SonarCloud) to use. You can:
      * select an existing endpoint from the drop down list
      * add a new endpoint
      * manage existing endpoints
      * specify which **SonarCloud Organization** to use by choosing an organization from the drop-down
   * Keep **Integrate with MSBuild** checked and specify at least the project key
      * **Project Key** - the unique project key in SonarCloud
      * **Project Name** - the name of the project in SonarCloud
      * **Project Version** - the version of the project in SonarCloud
4. Click the **Visual Studio Test** task and check the **Code Coverage Enabled** checkbox to process the code coverage and have it imported into SonarCloud. (Optional but recommended)

Once all this is done, you can trigger a build.

## Analyzing a Java project with Maven or Gradle
1. In your build definition, add:
   * At least **Prepare analysis on SonarCloud** task
   * Optionally **Publish Quality Gate Result** task
1. Reorder the tasks to respect the following order:
   * **Prepare analysis on SonarCloud** task before the **Maven** or **Gradle** task.
   * **Publish Quality Gate Result** task after the **Maven** or **Gradle** task.
1. Click on the **Prepare analysis on SonarCloud** task to configure it:
   * Select the **SonarCloud Service Endpoint**
   * Select your SonarCloud organization
   * Select **Integrate with Maven or Gradle**
2. On the Maven or Gradle task, in **Code Analysis**, check **Run SonarQube or SonarCloud Analysis**

Once all this is done, you can trigger a build.

## Analyzing a Visual C++ project
1. Make **Build Wrapper** available on the build agent
   * Download and unzip **Build Wrapper** on the build agent (see *Prerequisites* section of *C/C++/Objective-C* page). For the Microsoft-hosted build agent you will need to do it every time (as part of build pipeline), e.g. you can add **PowerShell script** task doing that. For the self-hosted build agent you can do the same either every build or only once (as part of manual setup of build agent). Example of PowerShell commands:
   ```
   Invoke-WebRequest -Uri '<sonarcloud url>/static/cpp/build-wrapper-win-x86.zip' -OutFile 'build-wrapper.zip'
   Expand-Archive -Path 'build-wrapper.zip' -DestinationPath '.'
   ```
2. In your build pipeline, add:
   * At least **Prepare analysis on SonarCloud** task, **Run Code Analysis** task and the **Command Line** task
   * Optionally **Publish Quality Gate Result** task
3. Reorder the tasks to respect the following order:
   * **Prepare analysis on SonarCloud** task before **Command Line** task.
   * **Run Code Analysis** task after the **Command Line** task.
   * **Publish Quality Gate Result** task after the **Run Code Analysis** task
4. On the **Command Line** task
   * Run **Build Wrapper** executable. Pass in as the arguments (1) the output directory to which the Build Wrapper should write its results and (2) the command that runs the compilation of your project, e.g.
   ```
   path/to/build-wrapper-win-x86-64.exe --out-dir <output directory> MSBuild.exe /t:Rebuild
   ```
5. Click on the **Prepare analysis on SonarCloud** task to configure it:
   * Select the **SonarCloud Service Endpoint**
   * Select your SonarCloud organization
   * In *Additional Properties* in the *Advanced* section, add the property `sonar.cfamily.build-wrapper-output` with the value of the directory you specified: `sonar.cfamily.build-wrapper-output=<output directory>`

Once all this is done, you can trigger a build.

## Analysing other project types
If you are not developing a .NET application or a Java project, here is the standard way to trigger an analysis:

1. In your build definition, add:
   * At least **Prepare analysis on SonarCloud** task and **Run Code Analysis** task
   * Optionally **Publish Quality Gate Result** task
2. Reorder the tasks to respect the following order:
   1. **Prepare analysis on SonarCloud**
   2. **Run Code Analysis**
   3. **Publish Quality Gate Result**
3. Click on the **Prepare analysis on SonarCloud** task to configure it:
   * Select the **SonarCloud Service Endpoint**
   * Select your SonarCloud organization
   * Select **Use standalone scanner**
   * Then:
      * Either the Sonar properties are stored in the (standard) `sonar-project.properties` file in your SCM, and you just have to make sure that "Settings File" correctly points at it. This is the recommended way.
      * Or you don't have such a file in your SCM, and you can click on **Manually provide configuration** to specify it within your build definition. This is not recommended because it's less portable.

Once all this is done, you can trigger a build.

## Branch and Pull Request analysis

### Branches
When a build is run on a branch of your project, the extension automatically configures the analysis to be pushed to the relevant project branch in SonarCloud. The same build definition can apply to all your branches, whatever type of Git repository you are analyzing,

If you are working with branches on TFVC projects, you still need to manually specify the branch to be used on SonarCloud: in the **Prepare analysis on SonarCloud** task, in the **Additional Properties**, you need to set `sonar.branch.name`.

### PRs
SonarCloud can analyze the code of the new features and annotate your pull requests in Azure DevOps with comments to highlight issues that were found.

Pull request analysis is supported for any type of Git repositories. To activate it:

1. In the **Branch policies** page of your main development branches (e.g. "master"), add a build policy that runs your build definition
2. Create an Azure DevOps token with "Code (read and write)" scope
3. Set this token in the **Azure DevOps** section, under **Administration**, **General Settings**, then **Pull Requests**

Next time some code is pushed in the branch of a pull request, the build definition will execute a scan on the code and publish the results in SonarCloud which will decorate the pull request in Azure DevOps.

## Using Release Pipelines
You have the possibility to check the SonarCloud Quality Gate status in your release pipeline. It takes place as a [pre-deployment gate](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/approvals/gates?view=azure-devops).

1. In the **release pipeline**, add a stage, then click on **pre-deployment conditions**.
2. Enable the **gates**, then click on add. Choose **SonarCloud Quality Gate status check**
3. Save your pipeline.

**This feature is currently in preview, and the following notes are important** :

* The **Publish Quality Gate Result** task (in your build pipeline) has to be enabled in order to get this gate working.
* If the quality gate is in the failed state, it will not be possible to get the pre-deployment gate passing as this status will remain in its initial state. You will have to execute another build with either the current issues corrected in SonarCloud, or with another commit for fixing them.
* Please note also that current behavior of the pre-deployment gates in Release Pipelines check every 5 minutes the status, for a duration of 1 day by default. Knowing the fact that if the SonarCloud quality gate is failed and it will remains like this on Azure DevOps, you can decrease this duration to a maximum of 6 minutes (so the gate will be evaluated only twice), or just cancel the release itself.
* Only the primary build artifact related Quality Gate of the release will be checked.
* During a build, if multiple analyses are performed, all of the related Quality Gates are checked. If one of them has the status either WARN, ERROR or NONE, then the Quality Gate status on the Release Pipeline will be failed.

## Quality Gate Status widget 

You can monitor the Quality Gate status of your projects directly in your Azure DevOps dashboard. Follow these simple steps to configure your widget:

1. Once the Azure DevOps extension is installed and your project has been successfully analyzed, go to one of your Azure DevOps dashboards (or create one). Click on the pen icon in the bottom right corner of the screen, and then on the "+" icon to add a widget. 

2. In the list of widgets, select the "Code Quality" one and then click on the "Add" button. An empty widget is added to your dashboard. 

3. You can then click on the widget's cogwheel icon to configure it.

    * **For public projects:** you can simply select your project from the dropdown. A searchbar inside the dropdown will help you find it easily. Just select it and click on the "Save" button.

    * **For private projects:** you'll have to log in using the links provided under the dropdown. Once logged in, your private projects will appear in the dropdown. Select the one you are interested in, and click on "Save".

## FAQ
**Is it possible to trigger analyses on Linux or macOS agents?**  
This becomes possible from version <!-- sonarqube -->4.0 of the SonarQube task<!-- /sonarqube --><!-- sonarcloud -->1.0 of the SonarCloud extension<!-- /sonarcloud -->, in which the extension was fully rewritten in Node.js. The mono dependency was dropped in version <!-- sonarqube -->4.3<!-- /sonarqube --><!-- sonarcloud -->1.3<!-- /sonarcloud -->.

This is not possible with previous versions of the extension.

**How do I break the build based on the quality gate status?**  
This is not possible with the new version of the extension if you are using the most up-to-date versions of the tasks. We believe that breaking a CI build is not the right approach. Instead, we are providing pull request decoration (to make sure that issues aren't introduced at merge time) and we'll soon add a way to check the quality gate as part of a Release process.
