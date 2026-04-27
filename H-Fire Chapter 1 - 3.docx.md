  
**H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts**

A Capstone Project Presented to the Faculty of the  
College of Computing Studies  
Laguna University

In Partial Fulfillment of the Requirements for the Degree of   
Bachelor of Science in Information Technology with a   
Specialization in System Development

Maguyon, Januar Brayan O.  
Ambid, Laurenze Dave R.  
Coladilla, Ken Harvee D.  
Lacsi, Archie D.  
Tigle, Rhein B.

April 2026  
**TABLE OF CONTENTS**

|  | Page |
| :---- | ----- |
| **TITLE PAGE** | i |
| **APPROVAL SHEET**  | ii |
| **EXECUTIVE SUMMARY** | iii |
| **ACKNOWLEDGEMENT** | v |
| **TABLE OF CONTENTS**  | vi |
| **LIST OF TABLES** | viii |
| **LIST OF FIGURES**  | xii |
| **LIST OF APPENDICES** | xviii |
| **CHAPTER I – INTRODUCTION** |  |
| Project Context  | 2 |
| Purpose and Description  | 3 |
| Objective of the Study  | 4 |
| Scope and Limitations of the Research  | 5 |
| Definition of Terms  | 6 |
|  |  |
| **CHAPTER II – REVIEW OF RELATED LITERATURE / SYSTEMS** |  |
| Technical Background | 8 |
| Related Literature and Studies       | 8 |
| Synthesis  | 19 |
| Theoretical Framework  | 20 |
| Conceptual Framework | 21 |
|  |  |
| **CHAPTER III – RESEARCH METHODOLOGY**  |  |
| Research Design  | 22 |
| Population of the Study  | 23 |
| Statistical Treatment of Data  | 24 |
| Likert Scale Method  | 25 |
| Data Collection Procedure  | 26 |
| Requirement Analysis  | 27 |
| Research Instrument  | 29 |
| Requirement Documentation | 30 |
| Design of Software, System, Product, and/or Process | 31 |
| Development and Testing | 32 |
| Implementation Plan |  |
|  |  |

**LIST OF TABLES**

|  Table |  Description |  Page |
| :---: | ----- | :---: |
| 1 | Respondents of the Study | 24 |
|  |  |  |
|  |  |  |

**LIST OF FIGURES**

| Figure | Description | Page |
| :---: | ----- | :---: |
| 1 | Conceptual Framework of the Study | 21 |

**CHAPTER I**

**INTRODUCTION**  
The safety and security of residential environments are constantly threatened by the unpredictable nature of fire outbreaks and hazardous gas leakages. In the Philippines, the rapid expansion of residential subdivisions and the high-density nature of Homeowners' Association (HOA) communities have increased the vulnerability of households to these disasters. Despite the presence of traditional fire safety protocols, many residential areas still rely on outdated or standalone systems that are often insufficient for the complexities of modern living. Ensuring effective disaster prevention relies heavily on the ability to detect hazards early and disseminate information rapidly to all affected parties.  
The use of conventional methods such as manual alarms or standalone smoke detectors can be limited, as they often lack the connectivity required for remote notification. These outdated practices make it difficult to maintain constant surveillance, especially when homeowners are away from their properties. As a result, residential hazards can quickly become unmanageable, leading to confusion, delayed emergency response, and a significant waste of time and resources. Property owners and HOA stakeholders often find themselves burdened with the inability to act proactively during the critical first minutes of a fire or gas leak incident (Khan et al., 2022).  
The emergence of the Internet of Things (IoT) offers an efficient solution by enabling secure, standardized, and centralized data exchange. Systems based on IoT frameworks allow for real-time monitoring and instant communication, effectively avoiding the dangers of miscommunication and data loss during emergencies. Such systems facilitate remote access, automated logging, and smooth coordination between residents and administrators, positioning the community as a digitally enabled environment ready to handle modern safety demands.  
To address these needs, the researchers suggest the design and deployment of H-Fire, an IoT-integrated fire and gas leak monitoring system tailored to the specific needs of residential communities. The system would serve as a central monitoring repository for environmental data, where all significant readings and incidents are well-organized, retrievable, and secure. The H-Fire system would incorporate real-time updates, multi-layered alerts, and role-based access to allow stakeholders to locate and respond to hazard information in a moment.

## 

## **Project Context**

Residential fires and gas leaks remain a critical hazard in the Philippines, with the Bureau of Fire Protection (BFP) recording an average of 12,000 incidents annually. These risks are particularly high in dense housing developments like BellaVita in Pila Laguna, where closely-knit housing units mean a localized fire can rapidly endanger the entire neighborhood.  
At present, BellaVita lacks any dedicated devices or integrated systems for detecting fire, smoke, and gas leaks. Residents rely purely on manual observation and physical presence to identify hazards, which is highly unreliable, especially when homeowners are away or asleep. This absence of an early warning mechanism leads to significant communication gaps and delayed emergency responses, leaving the community vulnerable to total property loss.  
The H-Fire System was initiated to address this critical safety gap by providing a centralized and automated monitoring framework. By integrating ESP32 microcontrollers and IoT sensors, the project seeks to move the community from zero detection to a real-time, digital alerting system. The implementation of H-Fire will provide both residents and HOA administrators with instant notifications through a two-tier mobile application ecosystem, ensuring that potential disasters are identified and reported before they can escalate.

**Purpose and Description**  
	The H-Fire System is an IoT-based fire and gas leak monitoring platform designed to establish an automated safety infrastructure for residential communities. The project aims to transition BellaVita from a manual observation method to a cloud-integrated framework, addressing the absence of detection devices and the "human delay" in emergency reporting. By utilizing ESP32 microcontrollers, MQ-2 gas sensors, and KY-026 flame detectors, the system provides continuous surveillance and multi-layered alerts including audible sirens, push notifications, and full-screen emergency modals to ensure hazards are identified the moment they occur.  
The purpose of this study is to develop a synchronized monitoring ecosystem composed of a Hardware Layer for real-time sensing, a Communication Layer using HiveMQ MQTT and Node.js for low-latency messaging, and a Data Layer via Supabase for secure storage. The system features a two-tier mobile application built with React Native  a Resident App for individual household monitoring and an Admin App for HOA officers, providing a centralized Command Centre and Live Community Map for neighborhood-wide oversight.  
The following general population benefits from the study:  
**Homeowners and Residents.** They gain a dedicated tool for remote monitoring and instant notifications, allowing for immediate intervention even when they are away or asleep.  
**HOA Officers and Community Administrators.** The system provides a bird’s-eye view of all households, enabling faster verification of alarms and a more coordinated community emergency response.  
**Future Researchers.** This study serves as a technical reference for IoT-based residential security and real-time sensor-to-cloud integration, fostering further innovation in smart community safety.

**Objectives of  the Study**  
The primary objective of this study is to design, develop, and implement H-Fire, an IoT-integrated fire and gas leak monitoring system that provides real-time hazard detection, cloud-based data management, and a multi-layered emergency notification ecosystem for the residents and administrators of BellaVita.  
Specifically, the system aims to:

1. To develop ESP32-based sensor nodes integrating the MQ-2 gas sensor and KY-026 flame sensor, enabling the system to continuously measure gas concentration (PPM) and detect flame presence for immediate local and remote reporting.  
2. To incorporate a multi-layered emergency notification functionality that triggers synchronized alerts across different channels, allowing stakeholders to receive:  
   2.1 Local hardware alerts (LCD readout and buzzer);  
   2.2 Full-screen in-app emergency sirens with haptic feedback; and

   2.3 Persistent push notifications for background alerting.  
3. To implement advanced security and data management measures to ensure the confidentiality and integrity of household telemetry, including:  
   3.1 Role-Based Access Control (RBAC) via PIN-based authentication;  
   3.2 Row-Level Security (RLS) for data privacy; and  
   3.3 Real-time cloud logging via Supabase and MQTT.  
4. To evaluate the H-Fire System performance based on ISO/IEC 25010:2023 standards, focusing on:  
   4.1 functional suitability;  
   4.2 performance efficiency;  
   4.3 compatibility;  
   4.4 interaction capability;  
   4.5 reliability;  
   4.6 security;  
   4.7 maintainability;  
   4.8 flexibility; and  
   4.9 safety.

**Scope and Limitation of the Study**  
The H-Fire System is an IoT-integrated fire and gas leak monitoring platform designed to enhance residential safety and emergency coordination within the BellaVita in Pila Laguna. This system aims to address the critical absence of detection devices and the "human delay" in emergency reporting by providing an automated, real-time alert ecosystem. The scope of the project encompasses the deployment of a hardware prototype consisting of ten (10) ESP32-based sensor nodes across five (5) selected households. Each household will have two devices strategically positioned in high-risk areas such as kitchens and garages to monitor combustible gas concentrations (PPM) via MQ-2 sensors and open flame signatures via KY-026 infrared sensors. The system is governed by a three-tier alert threshold ranging from Safe, Warning, to Danger which triggers local audible alarms and a multi-layered digital notification system based on the severity of the detected hazard.  
The system is designed with a two-tier mobile application ecosystem built using Expo and React Native, supporting both Android and iOS platforms. These applications are tailored for three primary user roles: Resident, HOA Manager, and Admin. The Resident role allows individual homeowners to monitor their own registered devices, receive full-screen emergency sirens with haptic feedback, and manage their home location settings. The HOA Manager role provides read-only access to a centralized Command Centre dashboard and an interactive community map for neighborhood-wide oversight. Meanwhile, the Admin role holds full system control, including the authority to formally resolve incident records and manage security settings. Data integrity and privacy are maintained through a robust cloud infrastructure utilizing HiveMQ for MQTT messaging and Supabase for database management, integrated with Row-Level Security (RLS) to ensure that residents can only access data pertaining to their own households.  
Despite its technological advantages, the study is subject to several limitations. The system is strictly internet-dependent, requiring a stable WiFi connection for the ESP32 devices to transmit data and for the mobile apps to receive remote alerts. In the event of a network outage, only local alarms (buzzer and LCD) will remain functional, and remote notification will be unavailable. Furthermore, H-Fire is an academic prototype and not a commercially certified fire suppression system; it does not include automated suppression mechanisms like sprinklers or gas shut-off valves. The system is also limited in scale, designed and tested for a small-scale deployment of up to five households, and relies on the accuracy of the MQ-2 sensor, which may require periodic calibration and cannot differentiate between specific types of combustible gases.  
Another significant limitation is the system's reliance on voluntary resident participation for its map functionality, as households must manually pin their GPS coordinates to appear on the Admin's community map. From a security perspective, the Resident App utilizes locally stored profile IDs rather than full account authentication, meaning that profile data is device-specific and may be lost if the application is uninstalled. Additionally, the system’s cloud-to-database bridge is hosted on a free-tier service which, despite keep-alive mechanisms, may experience brief latency or "cold-start" delays. By implementing this system, the researchers aim to provide a foundational model for IoT-based community safety that minimizes data loss and improves emergency response times in residential subdivisions.

**Definition of Terms**  
In this research, the researchers provide clear explanations for key terms and concepts to enhance the understanding of their project, the “H-Fire: An IoT-Integrated Fire and Gas Leak Monitoring System”. These explanations aim to make it easier for readers to grasp how the system functions and its technical operation.  
**Admin App** A specialized mobile application built for community administrators and HOA officers to provide a centralized Command Centre dashboard and neighborhood-wide safety monitoring.  
**Captive Portal** A web page served by the ESP32 when it operates as a WiFi access point, allowing users to enter WiFi credentials and configuration parameters through a browser interface.  
**Cold Start** The delay experienced when a cloud service that was idle is reactivated after a period of inactivity, specifically relevant to the bridge service on Render.com.  
**Cron-Job.org** A free scheduled HTTP request service used to periodically ping the Render.com-hosted bridge to prevent it from going idle due to inactivity timeouts.  
**Device Registry** The specific table in Supabase that maps each ESP32's MAC address to its household name, room label, and owner profile for human-readable identification.  
**Emergency Modal** A full-screen overlay UI component that blocks app interaction and triggers continuous alarms and vibrations until acknowledged by the user.  
**ESP32** A low-cost, low-power system-on-chip microcontroller with integrated WiFi and Bluetooth that serves as the brain of each H-Fire sensor node.  
**Expo** An open-source framework and platform used for building and deploying universal React Native applications for the H-Fire project.  
**Expo Push Token** A unique identifier issued to a specific device installation, used by the system to target push notifications to the correct user.  
**Haptic Feedback** Tactile vibration patterns generated by a mobile device to ensure the user's attention during emergency alerts, even if the device is on silent mode.  
**HiveMQ Cloud** A cloud-hosted MQTT broker service providing the secure messaging infrastructure for real-time data exchange between devices and apps.  
**HOA (Homeowners' Association)** An organization within a residential community that, in this study, is provided with read-only monitoring access to all community devices.  
**Incident** A database record created when hazardous conditions (PPM \> 450 or flame detection) are detected, used to track emergency events across the community.  
**KY-026 Sensor** An infrared flame detection module that outputs a signal when it detects infrared radiation characteristic of open flames.  
**MAC Address** A unique hardware identifier assigned to each network interface, used in H-Fire as the primary key for device identification.  
**MQ-2 Sensor** A semiconductor-based gas sensor used to detect concentrations of combustible gases and smoke, outputting an analog voltage proportional to gas concentration.  
**MQTT (Message Queuing Telemetry Transport)** A lightweight publish-subscribe messaging protocol designed for IoT devices, used for real-time sensor data transmission to the cloud.  
**MQTT-to-Supabase Bridge** A custom Node.js server-side process that processes incoming MQTT sensor data and writes structured records to the Supabase database.  
**PPM (Parts Per Million**) A unit of measurement indicating gas concentration in the air, used to classify air quality into Normal, Warning, or Danger levels.  
**Push Notification** A message sent from a server to a mobile device that appears even when the target application is not actively open.  
**React Native** A JavaScript framework used for building native mobile applications for Android and iOS, serving as the core technology for the H-Fire apps.  
**Realtime Subscriptions** A Supabase feature that pushes instant database change events to connected clients, enabling immediate incident notifications.  
**Render.com** A cloud platform-as-a-service (PaaS) used to host the H-Fire bridge as a long-running background service.  
**Resident App** A mobile application designed for individual homeowners to monitor their own registered devices, receive personal alerts, and manage household settings.  
**RLS (Row-Level Security)** A PostgreSQL feature that restricts database access based on user roles, ensuring residents can only access their own household data.  
Supabase. An open-source backend platform used for the relational database, security policies, and real-time data features of the H-Fire system.  
**WiFiManager** An Arduino library that enables the ESP32 to create a temporary access point for end-users to configure WiFi credentials without modifying source code.

	

**CHAPTER II**

**REVIEW OF RELATED LITERATURE** 

**Technical background**  
The development of H-Fire integrates advanced hardware and cloud-based software to provide a real-time safety solution for the BellaVita. The system is built on a "device-to-app" architecture designed for high reliability and low-latency emergency response. The core of the hardware layer is the ESP32 microcontroller, selected for its dual-core processing and integrated WiFi capabilities. It manages the MQ-2 gas sensor and KY-026 flame sensor, utilizing the Arduino Framework (C++) and WiFiManager to allow users to configure network credentials easily via a captive portal.  
For data transmission and management, the system utilizes the MQTT (Message Queuing Telemetry Transport) protocol through HiveMQ Cloud, ensuring lightweight and fast messaging between the devices and the cloud. This is integrated with Supabase, a backend-as-a-service built on PostgreSQL, which handles the relational database and enforces Row-Level Security (RLS) for data privacy. A custom Node.js bridge hosted on Render.com facilitates the translation of sensor telemetry into actionable database records and triggers real-time alerts.  
The frontend is developed using React Native and Expo SDK, allowing for a unified codebase that delivers a native mobile experience for both Android and iOS. This framework supports critical features such as Push Notifications, haptic feedback, and emergency sirens. By using Supabase Realtime, the apps receive instant updates without manual refreshing. Together, these technologies form a scalable and dependable infrastructure that transitions traditional residential monitoring into a proactive, digital-first fire and gas safety system.

**Related Literature and Studies**   
**Foreign Literature of the Current Technology** 

 **IoT Residential Fire Safety**  
The research Integrating IoT Technology for Fire Risk Monitoring and Assessment in Residential Building Design by Hao Wang, Jiazheng Liao, and Xingyuan Chen (2025) shows how quickly the field of residential safety is changing. Their study uses a methodical assessment approach to investigate how smart technologies improve the assessment of fire hazards in contemporary dwellings. In contrast to standard fire safety audits, which are frequently criticized for being static and out of date, the authors show that real-time data collecting offers a more dynamic and realistic risk assessment. The study demonstrates that residential structures can greatly reduce possible disasters through ongoing supervision and data-driven insights by including IoT during the planning phase. The transition from human inspections to automated monitoring is highlighted in this study as a crucial milestone for urban safety.  
Since it reflects the fundamental goal of switching from passive smoke detectors to a proactive, community-integrated monitoring environment, this conceptual framework is the main basis for the proposed project. By putting these ideas into practice, the existing system turns residential safety from a reactive measure into an active management tool that evaluates threats inside nearby subdivisions in real time. This guarantees that fire risk assessment is no longer a one-time occurrence but rather an ongoing procedure that keeps track of each networked unit's safety condition. This study's integration enables the creation of safety criteria that are supported by science, guaranteeing that the homeowners association can handle hazards precisely and responsibly, which is essentially in line with current smart city safety regulations.  
Sameer Al-Ani and Husam Jasim (2024) address the development of an Internet of Things-based smart fire detection system using ESP32 in an effort to achieve technical efficiency. The technical viability of utilizing inexpensive microcontrollers to deliver advanced safety features in home settings is the main emphasis of this study. Through the use of an experimental technique, the authors demonstrate how localized smart systems can make advanced safety technology more accessible by bridging the gap between costly industrial fire safety and the financial limits of average households. The capacity of these systems to process data locally before transmitting it to the cloud, which guarantees that warnings are activated even during brief internet outages, is what makes them so effective, according to researchers. Their approach offers a technical framework for creating autonomous, robust safety nodes.  
The idea is essentially in line with the present development's mission, which is to use affordable yet dependable hardware solutions to give subdivision-wide protection. Al-Ani and Jasim's technical insights support the choice of the dual-core microcontroller architecture, guaranteeing that Laguna inhabitants may afford the system without sacrificing its high-performance detection capabilities. The initiative is able to provide professional-grade fire and gas leak monitoring solutions that are especially suited to the financial realities of residential communities by using this localized method. By optimizing the hardware-to-cloud ratio, the study's application guarantees that every home has a reliable, scalable, and low-maintenance gadget. This strategy encourages access control and security throughout the management platform.  
Adrian-Gabriel Guran, Mihai-Florin Ionescu, and Radu-Constantin Popa (2025) investigate environmental aspects further in their work, Contributions to the Development of Fire Detection and Intervention Capabilities Using an Indoor Air Quality IoT Monitoring System. According to their findings, keeping an eye on particulate matter and gas concentrations may enable quicker action before a large-scale fire breaks out. Using environmental data, the researchers demonstrated that changes in air quality frequently occur before visible flames, offering a crucial window for early warning. According to their findings, a comprehensive safety system should incorporate chemical sensing in addition to basic smoke detection, as this greatly lowers the possibility of false negatives and improves the general dependability of home safety procedures. Multi-sensor systems are essential for creating comprehensive interior environments, according to study.  
The idea is intricately woven into the design of the suggested safety system, in which a number of sensors, including flame and gas detectors, cooperate to send occupants multi-level alarms. The project ensures that the device actively monitors environmental changes that indicate a potential threat, such as an LPG leak, rather than waiting for a fire to start by adhering to the results of Guran et al. This strategy effectively reduces the risk of an explosion by extending the window of opportunity for occupants to safely handle the leak or evacuate. This study's application emphasizes how important it is to control access to vital sensor data so that the proper people may get high-priority information when they need it. By improving real-time monitoring, this technique builds a safe platform that safeguards data.  
Sneha Patel, Rajesh Singh, and Arvind Kumar (2023) investigate IoT-based smart fire detection and notification systems. This study highlights how cloud-enabled notification procedures help guarantee that homeowners, wherever they may be, receive immediate alerts. The authors show how IoT may convert conventional passive fire alarms into active warning systems that increase overall community resilience using a prototype-based technique. According to their research, a fire safety system's efficacy is closely correlated with its capacity to communicate across various platforms and promptly reach the targeted consumers. The study's emphasis on cloud integration offers a road map for creating safety systems that are not constrained by geographical limits, enabling a more inclusive approach to contemporary catastrophe management.

**ESP32 and Sensor Performance**  
Nianwen Wang and Zhen Li (2024) examine the effectiveness of hardware in safety applications in their paper, Efficiency of ESP32 Microcontrollers in Real-Time Monitoring Systems. The ESP32's dual-core design is crucial for systems that need to analyze data and communicate wirelessly at the same time, according to this study, which focuses on the processor's power consumption and processing capabilities when handling continuous sensor input. Their results show that the microcontroller can continue to operate at a high level even when faced with complicated logic and frequent data transfer. The study also emphasizes the significance of energy efficiency in IoT nodes, arguing that a well-designed system must strike a balance between power stability and performance to guarantee long-term dependability in crucial settings where continuous uptime is essential for safeguarding local lives.  
	The hardware design of the suggested safety solution, in which the ESP32 functions as each residential node's central brain, directly incorporates these findings. The system can operate the MQTT communication protocol without experiencing any system delays while concurrently monitoring sensors for gas and fires by leveraging its multitasking capabilities. This strategy promotes a safe and effective management platform for residential safety by boosting security and guaranteeing that the system is resilient in a variety of environmental circumstances. The implementation of this study guarantees that the project attains a degree of hardware stability typical of professional industrial systems, guaranteeing that data is managed by authorized users while the device keeps a steady connection to the cloud to safeguard Laguna inhabitants.  
	Liang Zhao, Wei Zhang, and Ming Liu's (2024) Performance Analysis of MQ-2 Gas Sensors for Fire Detection in Smart Buildings is a pertinent performance analysis. The sensitivity of the MQ-2 sensor against several flammable gases, such as propane and LPG, was measured by the researchers using laboratory-controlled trials. Regarding the sensor's reaction time and threshold accuracy, which are crucial for averting mishaps before they turn into structural fires, a number of conclusions may be drawn. Their study demonstrates that, when appropriately calibrated and filtered for ambient noise, MQ-2 sensors are quite successful in detecting quantities of dangerous gases. This study emphasizes how important sensor selection is in the creation of life-saving IoT systems, where hardware precision and speed are critical considerations.  
	The capacity of Zhao et al.'s effort to advance high-precision detection inside the existing residential monitoring system is what makes it significant. The MQ-2 sensor may be adjusted to identify gas leaks as soon as possible, which is crucial for safety, by being aware of its performance limitations and calibration requirements. In keeping with the goal of creating a safe fire prevention system, this detecting capacity enables the system to sound alarms and notify occupants via mobile devices before a fire ever starts. By providing responders with precise information about the threat prior to their arrival, integrating these sensor performance criteria improves overall safety and maximizes workflow productivity. This approach reduces damage risk and encourages responsibility with regard to safety thresholds.  
Design and Accuracy Testing of ESP32-based Gas and Flame Detectors, a work by I Gede Putu Krisna Juliharta and I Putu Gede Abdi Sudiatmika (2023), investigates the accuracy of sensor calibration in emergency situations. By concentrating on accuracy testing, the authors present empirical evidence demonstrating that hardware optimization and software filtering may produce high-precision detection. Their study highlights that a fire detector's dependability is dependent on both the sensor and the underlying circuitry that converts electrical data into useful alarms. They show that strict testing procedures are required to get rid of false alerts, which frequently lead to people becoming complacent. This research guarantees that every safety device satisfies the highest criteria by offering a scientific approach to hardware design.  
This study supports the technological decisions taken in the present development, which favor software-level filtering and precise data rendering to guarantee that inhabitants receive trustworthy information. Similar to how Juliharta and Sudiatmika place a strong emphasis on technical accuracy, the system makes sure that only authorized workers are able to see or exchange vital safety information, improving security and efficiency in residential community fire detection procedures. The adoption of these accuracy testing techniques guarantees that the homeowners association can rely on the system's alerts, lowering the possibility of disclosing private information for improper use while guaranteeing that real risks are dealt with right away. This strategy improves the system's overall efficacy and establishes a safe platform where technology acts as a trustworthy sentinel for nearby property.  
The creation of an IoT-Based Fire Hazard Detection System utilizing ESP32 and MQ Sensors is documented by Fajri Kurniawan and Muhammad Iqbal (2023). This study highlights that connection stability is a key component of fire detection systems' efficacy by examining the long-term dependability of hardware-to-cloud connections in continuous monitoring scenarios. The researchers used actual data to show that an IoT safety network's integrity depends on consistent data packets. According to their research, a robust system has to have fail-safe procedures to deal with network outages so that the local alarm may continue to operate even if the cloud dashboard is inaccessible. This study offers a technological roadmap for creating long-lasting IoT safety networks that put data integrity and continuous uptime first in high-stakes situations.

**MQTT Real-Time Alert Protocols**  
A Comparative Study of MQTT and HTTP Protocols for IoT-Based Monitoring Systems by Dimitrios Sisinni and Paolo Ferrari (2022) reveals that MQTT performs noticeably better than HTTP in terms of bandwidth consumption and energy efficiency. For emergency systems, which must always function without overloading the local network, this is a crucial component. According to their research, the publish-subscribe paradigm of MQTT is far more suited for real-time applications where even a millisecond delay might be hazardous. The researchers show that MQTT offers a low-power microcontroller-friendly lightweight communication layer, enabling a scalable safety network that can process thousands of data points at once. The significance of protocol selection in establishing dependability is shown by this study.  
The architecture of the suggested system depends on MQTT to send emergency data from residential units with less network traffic, hence this discovery is essential to its development. The system guarantees that fire and gas leak notifications are conveyed without congestion by adhering to the results of Sisinni and Ferrari. Because the protocol may be set up to guarantee that information is only handled by the appropriate team members and permitted residents, this strategy improves security and simplifies permission administration, enhancing community safety efficiency. A safe and effective management system that simultaneously delivers data to the mobile app and the administration is made possible by the usage of MQTT. This technique guarantees the system's continued strength as a sentinel.  
Low-Latency Communication Frameworks for IoT-Enabled Emergency Response are examined in the paper by Amit Kumar and Sarika Singh (2025). This study shows that MQTT-based frameworks offer the speed required for life-saving warnings by examining how data transfer speed affects reaction times during a crisis. Since low latency directly impacts resident survival rates, the authors use a simulated setting to demonstrate that it is the most crucial statistic in any IoT-enabled emergency response system. Their study demonstrates that the foundation of disaster management is effective communication techniques, offering insights into how businesses may improve their networks to manage critical data during an emergency. The study offers a technological baseline for assessing real-time warning systems' performance by concentrating on latency.  
By incorporating these low-latency frameworks, the present system's real-time functionality is guaranteed technical support. The concept immediately helps local authorities or neighbors in the Laguna region respond more quickly by reducing the time it takes for an alert to reach a smartphone. By clearly defining user responsibilities in the emergency procedure, this approach not only reduces the possibility of unwanted data access but also fosters accountability by guaranteeing that the right people receive vital information right away. This research's application emphasizes how important it is to protect sensitive project data and promptly manage access to vital resources. Because the system can precisely coordinate safety actions during a crisis, this enhances both security and organization.  
MQTT-Based Push Notification Systems for Scalable IoT Applications, a study by Mohamed Abdel-Basset and Victor Chang (2025), examines administration for extensive alert systems. According to the study, the publish-subscribe strategy ensures that messages reach hundreds of users at once without overloading the network, making it very useful for community-wide notifications. The capacity of MQTT to classify messages into subjects enables very effective data routing, which is advantageous for organizing project operations in big contexts, as demonstrated by the researchers using empirical data. According to their results, the main obstacle to community-wide IoT systems is scalability, and in order to guarantee that no resident is left in the dark during an emergency, a well-designed notification framework must give priority to message delivery reliability. This research offers a scientific basis for network construction.  
Carlos Garcia and Elena Rodriguez's study from 2024 uses MQTT to evaluate reliable data transmission for IoT fire safety. This study focuses on Quality of Service (QoS) levels to guarantee data integrity during transmission, showing that MQTT can secure the delivery of crucial notifications even in locations with erratic internet access. The researchers evaluate how various QoS levels affect the dependability of fire alerts using empirical techniques, offering insights on the importance of efficient communication in high-stakes situations. Because a single missed alarm might have disastrous consequences, their findings imply that dependability is not only a technological attribute but also a prerequisite for fostering consumer confidence. A technological approach for assessing communication resilience is presented in this paper.  
The present system incorporates these concepts to guarantee that both people and authorities properly get fire alarms. In addition to improving real-time monitoring, this approach guarantees that the project's safety documentation and logs may only be seen or shared by authorized staff. The project is essentially consistent with creating a more secure and effective management system for home fire safety in Laguna by adhering to these reliability requirements. The implementation of this study guarantees that the system can offer a reliable and robust platform for every member of the community, guaranteeing that important safety reports can only be seen by those who are properly allocated. This strategy supports an all-encompassing safety net by improving security and efficiency in the subdivision's fire safety procedures.  
Security and privacy in IoT-based cloud monitoring systems are examined in a research by Joseph Vella and Christian Colombo (2024). This study emphasizes that encryption and decentralized storage are essential elements for preserving privacy by focusing on how cloud storage affects the vulnerability of personal resident data. The authors employ a threat-modeling technique to demonstrate how inadequate security might allow unauthorized parties to intercept household monitoring data, resulting in major privacy violations. According to their research, in order to guarantee that the user's right to privacy is never violated, security must be included into the basic design of an IoT system, from the sensor node to the cloud database. In order to prevent data-driven safety systems from becoming a source of danger, this study offers a scientific method for fostering confidence in smart technology.  
By implementing the security levels recommended by Vella and Colombo, a home's fire and gas status is kept private and shielded from unwanted access. By implementing these guidelines, the system builds user confidence by guaranteeing that their safety monitoring data is managed by a private, secure cloud architecture that upholds the goal of a more secure management platform. The application of this research emphasizes how important it is to set up a secure data management system that safeguards private information while preserving accessibility for authorized workers. This strategy improves security and guarantees that project papers may only be viewed or edited by authorized staff, which is essentially consistent with creating a safe and effective management system for the Laguna residential community.  
Architectural Patterns for Secure IoT Data Access and Management, an architectural research by Ronny Guimarães and Marco Antonio (2023), looks at the structures required to stop illegal database input. Because it guarantees that only legitimate entities can access particular resources, the researchers conclude that rigorous access management patterns are essential for systems managing sensitive data. By comparing various security practices, their research offers insights into how developers might safeguard their databases against internal abuse as well as external attacks. The authors stress that the foundation of a secure IoT system is a well-designed database architecture, emphasizing the need to protect important project data to advance general safety. This research offers a road map for creating safe platforms that put accountability and data integrity first in multi-user settings.  
This idea serves as the basis for the backend design, guaranteeing the security of the hardware-cloud link. The capacity of Guimarães and Antonio's work to advance security and access control—ensuring that only legitimately authorized users may access the specified system sites—makes it significant. By safeguarding sensitive project data while preserving accessibility for the right staff, this strategy improves security and efficiency in the subdivision's safety procedures. When engineers, contractors, and residents need access to various kinds of data, integrating these architectural patterns improves the system's overall security and facilitates the development of a safe platform. By clearly defining user responsibilities for a more secure monitoring system, this approach not only reduces the possibility of unwanted access but also encourages accountability.  
The application of Row-Level Security (RLS) to stop data breaches between neighbors is examined in a study titled Data Privacy Frameworks for Smart Community IoT Networks by Sarah Miller and Kevin Thompson (2024). RLS is crucial for protecting individual privacy in a setting of collective safety since it enables several users to access the same database while guaranteeing that they only view their personal data. The authors use a prototype system to show that RLS offers a strong barrier against cross-user data access, making it the best approach for managing multi-tenant databases. According to their study, sophisticated data isolation frameworks are becoming a fundamental need to safeguard users' personal space as communities grow more linked through smart technology. A technical approach for striking a balance between privacy and community safety is offered by this study.  
Taner Arslan and Cemalettin Ozturk's 2025 study explores Cloud-Native Database Systems' Modern Role-Based Access Control (RBAC). RBAC upholds the least privilege principle, which states that users should only have access to what is necessary for their specific jobs. In order to evaluate how RBAC may be used to manage various user groups and offer insights into the technical governance of cloud-native safety apps, the researchers employed an empirical technique. According to studies, RBAC ensures that only authorized organizations may access defined system areas, which significantly increases operational efficiency and safety. Organizations may reduce the risk of disclosing sensitive information to improper use by adhering to the basic guidelines of role assignment and role authorization, underscoring the importance of protecting sensitive data and controlling access to vital resources.  
This idea is essentially in line with the project vision, which defines distinct responsibilities for HOA administrators, system developers, and residents. Because engineers may handle the technical backend while residents are limited to monitoring their own sensors, the system's integration of RBAC maximizes workflow productivity and fosters responsibility. In tandem with creating a more secure document management system, this method improves security and simplifies permission management, guaranteeing that only authorized users may view, alter, or share sensitive project data. When engineers and residents need access to distinct data, integrating RBAC improves overall security and facilitates the development of a safe platform. This approach improves real-time monitoring and reduces the possibility of unwanted entry, which is advantageous for organizing community safety initiatives in the Laguna neighborhood.

**Cloud and Role-Based Security**  
Security and privacy in IoT-based cloud monitoring systems are examined in the paper by Joseph Vella and Christian Colombo (2024). This study emphasizes the need of encryption and decentralized storage for protecting privacy by focusing on how cloud storage affects the vulnerability of personal resident data. The authors employ a threat-modeling technique to demonstrate how inadequate security might allow unauthorized parties to intercept household monitoring data, resulting in significant privacy violations. According to their research, in order to guarantee that the user's right to privacy is never violated, security must be included into the basic design of an IoT system, from the sensor node to the cloud database. This study offers a methodical way to increase confidence in smart technologies.  
	By implementing the security levels recommended by Vella and Colombo, a home's fire and gas status may be kept private and shielded from unwanted access. By implementing these guidelines, the existing system builds user confidence by guaranteeing that their safety monitoring data is managed by a private, secure cloud architecture that upholds the goal of a more secure management platform. The use of this research emphasizes how important it is to set up a secure data management system that safeguards private data while allowing authorized workers to easily access it. This strategy strengthens security and guarantees that only authorized individuals may access or modify project papers, which is essentially in line with setting up a safe monitoring system for the residential community.  
	Architectural Patterns for Secure IoT Data Access and Management, an architectural research by Ronny Guimarães and Marco Antonio (2023), looks at the structures required to stop illegal database input. Because it guarantees that only legitimate entities can access particular resources, the researchers conclude that rigorous access management patterns are essential for systems managing sensitive data. By comparing various security practices, their research offers insights into how developers might safeguard their databases against internal abuse as well as external attacks. The authors stress that the foundation of a secure IoT system is a well-designed database architecture, emphasizing the need to protect important project data to advance overall safety. A path for creating safe platforms that put data integrity first is provided by this study.  
	This idea serves as the basis for the backend design, guaranteeing the security of the hardware-cloud link. The capacity of Guimarães and Antonio's work to advance security and access control ensuring that only legitimately authorized users may access the specified system sites makes it significant. By safeguarding sensitive project data while preserving accessibility for the right staff, this strategy improves security and efficiency in the subdivision's safety procedures. Incorporating these architectural patterns improves the overall security of the system and facilitates the development of a safe platform where residents and engineers need access to various kinds of data. By clearly defining user responsibilities for monitoring, this approach not only reduces the possibility of unwanted access but also encourages accountability.  
	The application of Row-Level Security (RLS) to stop data breaches between neighbors is examined in the study Data Privacy Frameworks for Smart Community IoT Networks by Sarah Miller and Kevin Thompson (2024). RLS is crucial for protecting individual privacy in a setting of collective safety since it enables several users to access the same database while guaranteeing that they only view their personal data. Because RLS offers a strong barrier against cross-user data access, the authors build a prototype system to show that it is the best approach for handling multi-tenant databases. According to their study, sophisticated data isolation frameworks are becoming a fundamental need to safeguard users' personal space as communities grow more linked through smart technology. This research offers a remedy.  
	Taner Arslan and Cemalettin Ozturk's 2025 study examines Cloud-Native Database Systems' Modern Role-Based Access Control (RBAC). RBAC upholds the least privilege principle, which states that users should only have access to what is necessary for their specific jobs. In order to evaluate how RBAC may be applied to manage various user groups and offer insights into the technical governance of cloud-native safety apps, the researchers employed an empirical technique. According to their study, RBAC ensures that only authorized organizations may access defined system areas, which significantly increases operational efficiency and safety. Organizations can reduce the risk of disclosing sensitive information to improper use by adhering to the basic guidelines of role assignment and role authorization, underscoring the importance of protecting sensitive data and controlling access.  
	This idea is essentially in line with the project vision, which defines distinct responsibilities for HOA administrators, system developers, and residents. Because engineers may handle the technical backend while residents are limited to monitoring their own sensors, the system's integration of RBAC maximizes workflow productivity and fosters responsibility. In tandem with creating a more secure document management system, this method improves security and simplifies permission management, guaranteeing that only authorized users may view, alter, or share sensitive project data.

**Mobile Emergency Monitoring Dashboards**  
Mobile Multi-User Interfaces for Disaster Management, a study by Seigo Matsuno, Hiroshi Katayama, and Kenichi Takahashi (2023), looks at how various UI designs affect user coordination and responsiveness in a crisis. The researchers examined how efficient communication via mobile dashboards might greatly enhance coordinated response initiatives in communities using an event study methodology. According to their results, a well-designed interface must concurrently give various stakeholders clear, actionable information so that everyone participating in an emergency is aware of their role and the incident's status. In addition to offering insights into how digital technologies might be utilized to improve real-time workforce monitoring and coordinate project operations during a disaster, this study highlights the need of good communication in high-stakes situations.  
Because it emphasizes the importance of the dual-dashboard architecture, this study is extremely pertinent. The project offers a customized experience for residents to manage individual units while providing the association with a centralized command perspective for community-wide coordination by utilizing Matsuno et al.'s insights on multi-user interfaces. This guarantees that the data transmitted via the app prompts prompt responses from responders, resulting in a more effective disaster management procedure. By enabling real-time monitoring and coordination of community safety initiatives, this strategy improves the system's overall efficacy.  
Cross-Platform Mobile Applications for Real-Time IoT Visualization is examined in a pertinent research by Luca Di Stefano and Marco Rossi (2025). The selection of development tools that guarantee the application stays responsive across all devices is justified by their study on cross-platform frameworks, which is essential for inclusive community safety. Using a comparative study of several mobile frameworks, the researchers discovered that React Native and related technologies offer excellent performance and accessibility. According to their research, a crucial element in the uptake of smart safety technology is the capacity to see sensor data in real-time on any device.  
In addition to improving user accessibility, this approach facilitates the development of a safe platform where relevant staff members may effectively examine and exchange project documents. In the same way as Di Stefano and Rossi concentrate on high-performance visualization, the present project makes sure that its mobile dashboard gives all authorized users accurate and up-to-date data. This is essentially in line with creating a safe and effective management system that safeguards private data while preserving accessibility for all residential stakeholders. Applying this study to the present development guarantees that the system will continue to be responsive and user-friendly, laying the groundwork for a secure and role-based access control system. The project can advance organization and security by adhering to these guidelines.  
The Human-Centric Design for Emergency Notification Dashboards study by Elena Smith and Mark Johnson (2025) looks into how layout affects reaction times psychologically. In order to lessen cognitive burden during a fire emergency, the authors offer advice on how to build interfaces that put clarity and urgency first. They explore how various visual signals, such color and iconography, might speed up users' comprehension and response to an alert using an empirical technique. Because it allows inhabitants to take decisive action without being overtaken by complicated technological data, the researchers conclude that human-centric design is not only an aesthetic element but also a life-saving requirement. This study ensures that safety systems satisfy psychology by offering a technological baseline for assessing the efficacy of emergency interfaces.  
The mobile application, which prioritizes human-centric design to guarantee that every alarm is understood, directly incorporates this idea. The technology guarantees that users can comprehend the seriousness of a crisis at a single glance by employing clear color-coded warnings and loud push notifications, which boosts security and empowers people to take prompt action. By ensuring that only pertinent information is sent to the correct people at the right time, this strategy encourages an organized approach to managing emergency responses. By incorporating these design principles into the system, residents' and administrators' workflow productivity is maximized and overall security is improved. The capacity of Smith and Johnson's work to advance a safe platform that safeguards private data is what makes it significant.  
Developing Scalable IoT Dashboards with Modern JavaScript Frameworks is examined by Thomas Muller and Hans Schmidt (2025). Systems that monitor hundreds of sensors at once depend on their ability to handle huge data flow. In order to demonstrate that contemporary web frameworks can continue to function even during periods of heavy traffic, which is essential for community-wide safety networks, the researchers used a stress-testing approach. According to their results, current IoT dashboards must be scalable in order to accommodate data from a whole subdivision without crashing. In order to ensure that homeowners associations can rely on the system during even the worst catastrophes, our research offers a scientific basis for developing large-scale safety monitoring systems that prioritize data integrity and system stability.  
In order to ensure that the homeowners association's central monitoring dashboard is steady even while monitoring hundreds of residential sensors, this study is crucial to the present project. The method attains a level of operational efficiency and safety typical of professional businesses by adhering to Muller and Schmidt's recommendations. This strategy maximizes workflow efficiency and facilitates the development of a safe platform that safeguards personal household information while upholding a thorough community safety net. The use of scalable dashboard frameworks emphasizes how important it is to protect sensitive project data and effectively manage access to vital resources. By incorporating these technologies into the system, overall security is improved and real-time workforce monitoring and safety activity coordination are made possible. In the end, the effort makes sure that technological scalability is achieved.

**Local-Related Studies of the Current Technology**  
**Localized IoT for Home Safety**  
The Intelligent Fire Detection and Mobile Alert System for Home Safety research by Mark Anthony Castillo and Jayson Ramos (2024) looks at the difficulties in preventing fires in the Philippine setting. Their study highlights the efficacy of localized systems that employ reasonably priced mobile notification techniques to address the economic and environmental concerns of Filipino homes. Building on these discoveries, the present approach provides high-density communities with cutting-edge, reasonably priced technologies to solve particular safety vulnerabilities in Laguna. This method lays the groundwork for a safe access control system that is both economically and culturally appropriate for locals. By adhering to these research guidelines, the project guarantees that safety records are only managed by authorized persons, increasing community readiness and security.  
According to official data from the Bureau of Fire Protection (BFP) (2026), there is a growing tendency of structure fires brought on by defective wiring and gas leaks, underscoring the critical need for better monitoring. These results demonstrate that the system is an essential social requirement for safeguarding Filipino families and provide the fundamental justification for the ongoing development. By incorporating these BFP insights, the platform can efficiently target common fire causes, turning unprocessed data into a subdivision-specific safety plan. By limiting access to command parameters to authorized individuals, this method simplifies emergency management. By adhering to these statistical requirements, the system supports a more secure and dependable home environment by encouraging secure access management and guaranteeing that safety complaints are handled effectively.

**Digital Emergency Coordination**  
Jericho Santos and Maria Leonora De Jesus (2025) examine how digital platforms and real-time monitoring shorten crisis response times in a related study titled Online Emergency Response Management System for Calamba City DRRMO. Their research highlights how digital cooperation reduces catastrophe risk in Laguna more effectively than conventional approaches. The present project's institutional framework is provided by the implementation of this study, guaranteeing that it serves more general provincial safety objectives. The technology acts as a component of a bigger ecosystem that precisely manages emergency operations by coordinating with regional disaster response frameworks. By preventing illegal data access and fostering responsibility through well-defined user responsibilities for all responders, this synergy enables an organized approach to managing emergency resources.  
Mobile-based alerts greatly increase public preparedness, according to a study by Raymund Rodriguez and Elizabeth Sy (2026) titled Emergency Alert and Warning Systems and Their Impact on Sustainable Disaster Preparedness in the Philippines. According to their results, mobile-integrated IoT solutions are the best means of saving lives because the local market is heavily reliant on cellphones. The present concept, which uses a smartphone-integrated strategy to guarantee inhabitants stay informed, is essentially in line with this aim. By implementing these suggestions, the system maximizes community-wide readiness via role-based access restriction and real-time alerts. By ensuring that technology interventions align with the social behaviors of the local people, this approach effectively protects Laguna subdivisions while preserving a resilient community.

**Synthesis**  
	The researchers put together ideas from past studies on topics like IoT-based hazard detection, real-time gas monitoring, and cloud-integrated alert systems to help them understand the problems they are trying to solve. The researchers also looked at studies and literature from both local and foreign sources that were related to sensor technologies and mobile application frameworks that could help keep people safe in their homes and communities. The researchers made sure that the references they used were written and published in the last five years so that the study would be as useful as possible.  
	The IoT-based system for the BellaVita works like other systems for monitoring gas and fire. It lets users check on the environment from anywhere with an internet connection by using a cross-platform mobile app that works on any smartphone. The community's IoT-based safety system and other IoT-based safety systems already in place both allow for real-time data transmission and coordination. This lets users get instant readings and emergency alerts quickly. This makes sure that hazard monitoring for homes goes smoothly and that homeowners get alerts on time no matter where they are.  
	But the H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts made for the BellaVita has features like a dual-application ecosystem and a community-wide command center that make it easier to coordinate emergencies and stop people from taking too long to respond. Homeowners can easily keep an eye on their own sensor nodes, and the Homeowners' Association (HOA) administrators can keep an eye on the safety of the whole subdivision using a live community map. The system also has multi-layered alerts, such as hardware buzzers, mobile sirens, and constant haptic feedback, so that everyone involved knows about important events without having to report them manually. The researchers devised multiple strategies for enhancing the system's design, underpinned by prior studies and literature.  
**Theoretical Framework**  
	The theoretical framework serves as a guide for the researchers in systematically identifying and addressing issues and inefficiencies within the existing system. The researchers utilized an Input-Process-Output (IPO) model to conceptualize the development of the H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts.

**Figure 1**   
*Input-Process-Output diagram (IPO)*

Figure 1 shows the theoretical framework used by the researchers for the study. The theoretical framework served as a roadmap for analyzing and understanding the processes involved in developing and implementing the fire and gas monitoring system. The Input phase includes all the data and information gathered from the environment and the hardware components, which are essential for the system to function. The Process phase involves transforming this raw input data into meaningful and actionable information through various algorithms, logical steps, cloud-based computations, and security filtering. Finally, the Output is the result produced by the system after the data has been processed, which includes real-time status updates, multi-layered emergency alerts, and recorded data logs delivered through the mobile applications for the benefit of the homeowners and administrators.

**Conceptual Framework**  
The conceptual framework is an important component of research design, helping researchers to manage the theoretical foundation; this emphasizes its analysis to differentiate between each variable before the research. This model outlines the key components and steps involved in the system's development, helping to visualize how inputs are transformed through processes to produce the final output

**Figure 2**   
*Conceptual framework of the study*

Figure 2 displays the Conceptual Framework for H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts. This conceptual framework illustrates the relationship between the inputs, the processing system, and the outputs that arise from the implementation of an IoT-based monitoring system. It can guide the development of the H-Fire ecosystem, ensuring that the needs of homeowners and community administrators are met efficiently and effectively. The model highlights how environmental data requirements are processed through a multi-layered technology stack to generate useful outputs that streamline residential fire safety and emergency response management.

**CHAPTER III**

**DESIGN AND METHODOLOGY**

	This chapter presents the research design, development methodology, participants of the study, data gathering procedures, research instruments, requirement analysis, system resources, and testing procedures used in the development and evaluation of H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts. The chapter also discusses the system’s software and hardware components, development process, and evaluation procedures used to determine whether the proposed system meets its intended objectives. The study adopted a descriptive-developmental research design and utilized the Agile methodology through the Scrum framework to guide the iterative development of the system. This approach enabled the researchers to continuously refine the hardware and software components of H-Fire based on system requirements, testing results, and user feedback.

**Research Design**  
	The study employed a descriptive-developmental research design. The descriptive aspect was used to determine the current needs, problems, and limitations related to residential fire and gas hazard monitoring in the selected community. This enabled the researchers to understand the lack of dedicated detection devices, delayed manual reporting, and the need for real-time emergency notification and centralized monitoring. The developmental aspect was applied in the design, development, and refinement of the H-Fire system as a working prototype intended to address these identified concerns.

The researchers also used a mixed-methods approach in gathering evaluation data. Quantitative data were collected using structured questionnaires based on a Likert scale, while qualitative observations were obtained during system demonstration, testing, and user feedback sessions. These methods allowed the researchers to evaluate the system not only in terms of measurable usability and performance indicators, but also in terms of practical user experience and system applicability in a residential setting.

**Population of Study**  
	The population of the study refers to the group of individuals who are selected to participate in the evaluation of the proposed system and whose responses provide the necessary data for analysis. In this study, the population consisted of selected individuals who are considered potential users and evaluators of the *H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts*. These individuals include household residents, small business owners, and information technology (IT) students or professionals who possess sufficient knowledge and experience in system usage and evaluation. The inclusion of these groups ensures that the collected data reflects both practical user perspectives and technical insights, which are essential in assessing the system’s overall functionality and effectiveness.  
To ensure the relevance and reliability of the data, the researchers employed a purposive sampling technique, wherein respondents were carefully selected based on specific criteria aligned with the objectives of the study. This non-probability sampling method allowed the researchers to focus on individuals who are most likely to benefit from and interact with the proposed system. Household residents and small business owners were chosen due to their direct exposure to fire and gas-related risks, making them ideal evaluators of the system’s real-world applicability. Meanwhile, IT students and professionals were included to provide technical evaluation, particularly in terms of system performance, usability, and reliability.  
The total number of respondents involved in the study was (5 house holds), which is considered sufficient for gathering meaningful and analyzable data within the scope of the research. This sample size allowed the researchers to obtain diverse responses while maintaining manageability in data collection and analysis. Furthermore, the respondents were briefed about the purpose of the study and were given proper instructions before participating in the evaluation process to ensure the accuracy and consistency of their responses.  
By carefully selecting the participants and ensuring their relevance to the study, the researchers were able to gather reliable and valid data necessary for evaluating the effectiveness, usability, and acceptability of the H-Fire system. The chosen population played a crucial role in determining whether the proposed solution meets the needs and expectations of its intended users, thereby contributing to the overall success of the research.

The researchers present the **system increments** developed across **Sprints 1 to 4** using the **Scrum Framework of Agile Software Development**. Each increment represents a functional improvement in the development of the **H-Fire system**, including enhancements in **sensor integration**, **real-time monitoring**, **mobile alert notifications**, **dashboard features**, and other core system functions. These incremental outputs demonstrate the continuous progress of the project and the readiness of the system for further refinement and deployment.

Through incremental development, the researchers were able to gradually build, test, and improve the major components of the H-Fire system. This approach ensured that each completed sprint contributed a usable and measurable enhancement to the overall system. As a result, the incremental outputs served as evidence of the system’s steady development and alignment with the intended objectives of the study.

**Table 1**  
*Respondents of the Study*

**RESPONDENTS (R)  		 FREQUENCY (f)  		PERCENTAGE (%)**

| Household Residents  | 5 | 50% |
| :---- | :---: | :---: |
| HOA Officers / Administrators  | 2 | **20%** |
| IT Experts / Evaluators  | 3 | **30%** |
| TOTAL | **10** | **100%** |

Table 1 presents the distribution of the respondents involved in the evaluation of the proposed H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts. The respondents were composed of selected household residents, HOA officers or administrators, and IT experts/evaluators who were considered capable of assessing the system in terms of usability, functionality, reliability, and effectiveness. A total of ten (10) respondents participated in the study. The inclusion of these groups provided both practical user perspectives and technical evaluation relevant to the objectives of the research. 

**Statistical Treatment of Data**  
	The statistical treatment of data refers to the methods used by the researchers to organize, analyze, interpret, and present the data gathered from the respondents. In this study, appropriate statistical tools were employed to ensure the accuracy and reliability of the findings obtained from the evaluation of H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts. The use of statistical analysis enabled the researchers to transform raw data into meaningful information that served as the basis for the conclusions and recommendations of the study.

To describe the profile of the respondents, the researchers used frequency and percentage distribution. Frequency was used to determine the number of respondents under a specific category, while percentage was used to express these frequencies in relation to the total number of respondents. These statistical tools provided a clear summary of the respondents’ characteristics relevant to the evaluation of the system.

In assessing the system’s functionality, reliability, efficiency, usability, and overall acceptability, the researchers used the weighted mean as the primary statistical tool. The weighted mean was used to determine the average response of the respondents based on the five-point Likert scale in the questionnaire. This method allowed the researchers to quantify subjective responses and interpret them using descriptive equivalents.

The formula used in computing the weighted mean is:

Weighted Mean \= Σ(fx) / N

Where:  
 f \= frequency of each response  
 x \= numerical value of each scale  
 N \= total number of responses

The computed mean values were then interpreted using qualitative descriptions to determine the respondents’ level of evaluation of the proposed system. These descriptive equivalents were used to present the overall performance of the system in a more understandable and organized manner.

**Likert Scale Method**  
	The Likert Scale Method is a widely used approach in research for measuring respondents’ attitudes, perceptions, and level of agreement toward a particular subject. In this study, the Likert scale was utilized as the primary tool for evaluating the performance, usability, and overall acceptability of the *H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts*. This method enabled the researchers to quantify subjective responses and convert them into measurable data that can be statistically analyzed.  
A five-point Likert scale was employed in the questionnaire to determine the degree of agreement of the respondents with various statements related to the system. Each response was assigned a corresponding numerical value, which served as the basis for computing the weighted mean. The scale ranged from Strongly Disagree to Strongly Agree, providing respondents with a balanced set of choices that reflect varying levels of opinion and evaluation.

**Data Collection Procedure**  
	The data collection procedure describes the systematic steps undertaken by the researchers to gather the information needed for the development and evaluation of the proposed system. In this study, a structured process was followed to ensure that the data collected were accurate, reliable, and relevant to the objectives of the research. The procedure included the stages of problem identification, review of related literature, requirement analysis, system development, testing, survey distribution, and data analysis.

Initially, the researchers conducted a thorough review of related literature and existing studies to identify research gaps and define the requirements of the proposed H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts. This phase helped establish a clear understanding of the problem and guided the design of the system. After identifying the necessary requirements, the researchers proceeded with the development of the prototype by integrating the ESP32 microcontroller, MQ-2 gas sensor, KY-026 flame sensor, and the mobile application designed for real-time monitoring and emergency notification.

Once the system prototype was completed, a series of tests were conducted to evaluate its functionality, reliability, and responsiveness. The researchers simulated different hazard scenarios, including gas leak detection and flame detection, to determine whether the system could accurately identify dangerous conditions and send timely alerts to users. Necessary improvements and refinements were made based on the results of these tests in order to enhance the performance of the system.

Following the testing phase, the researchers prepared and validated the survey questionnaire, which served as the primary data-gathering instrument of the study. The questionnaire was designed to evaluate the proposed system in terms of functionality, usability, reliability, efficiency, and overall acceptability using a five-point Likert scale. Before distribution, the instrument was reviewed by qualified evaluators to ensure its clarity, relevance, and validity.

The validated questionnaires were then distributed to the selected respondents through purposive sampling. The respondents were first given an orientation and demonstration of the H-Fire system, including its hazard detection features, mobile notification functions, and monitoring interface. After interacting with or observing the system, they were asked to answer the questionnaire based on their evaluation of its performance and usability. Adequate time was given to allow the respondents to assess the system properly before completing the survey.

After all questionnaires were retrieved, the responses were organized, tabulated, and analyzed using appropriate statistical tools such as frequency, percentage, and weighted mean. The data collected from the respondents served as the basis for determining the effectiveness and acceptability of the proposed H-Fire system. Through this procedure, the researchers ensured that the gathered information was systematic, complete, and aligned with the objectives of the study.

**Research Instruments**  
	The research instruments used in this study consisted of both software-based and hardware-based tools. The primary instrument for evaluation was a structured questionnaire used to assess the functionality, usability, reliability, efficiency, and acceptability of the developed system. The questionnaire was based on a five-point Likert scale and was distributed to selected respondents after they had been given the opportunity to observe or interact with the system.

In addition to the questionnaire, the researchers used the actual H-Fire prototype as a research instrument. This included the ESP32-based sensor nodes, MQ-2 gas sensor, KY-026 flame sensor, 16x2 I2C LCD, piezoelectric buzzer, and the mobile applications developed for resident and administrative monitoring. The mobile applications served as the interface for viewing real-time data, receiving emergency notifications, monitoring incidents, and evaluating the usability of the system in practical operation.

**Requirements Documentation**  
	Requirement documentation was used to record and organize the system’s technical and user requirements throughout the design and development process. The researchers documented the system using diagrams and structured descriptions to ensure that each module of H-Fire was aligned with the project objectives. These include the use case diagram, conceptual framework, process flows, test plans, and structured descriptions of the software and hardware architecture.

The documentation also served as a reference for tracking the system’s features, identifying necessary revisions, and maintaining consistency across the hardware layer, cloud communication layer, data layer, and application layer. This process ensured that the final version of the H-Fire system remained consistent with its intended role as an IoT-based community fire and gas monitoring solution.

**Design of Software, Systems, Product and/or Processes**  
**Software Resources**  
**Table 2**  
*Software Resources*

| SOFTWARE | DESCRIPTION |
| :---- | :---- |
| Visual Studio | JavaScript programming language, HTML and CSS was  employed for the development of the system using Visual  Studio integrated development environment. |
|  |  |

Table 3 presents the software tools and development environments utilized by the researchers in the development of the H-Fire system. The researchers used Visual Studio Code as the primary integrated development environment for coding and system development. JavaScript was employed to handle system functionality, interactivity, and data processing within the application. HTML (Hypertext Markup Language) and CSS (Cascading Style Sheets) were used to structure and enhance the visual presentation of the system interface. Additionally, React Native and Expo SDK were utilized for developing the mobile applications, while Supabase and Node.js supported database management and backend operations.

**Hardware Resources**   
**Table 3**  
*Hardware Resources*

| HARDWARE | SPECIFICATIONS/MODEL |
| :---- | :---- |
| Microcontroller  Gas Sensor  Flame Sensor  Display Module  Alarm Device  Wireless Connectivity Power Source  Prototype Deployment   | ESP32-WROOM-32  MQ-2  KY-026  16x2 I2C LCD  Piezoelectric Buzzer  Built-in Wi-Fi  USB / Regulated Power Supply  10 sensor nodes across 5 households  |

	

Table 3 presents the hardware resources used in the development of the H-Fire system. The researchers utilized ESP32-WROOM-32 microcontrollers as the main processing units of the sensor nodes due to their built-in Wi-Fi capability and suitability for IoT-based applications. The system used the MQ-2 gas sensor to detect combustible gases and smoke, and the KY-026 flame sensor to detect the presence of open flame. These sensors were integrated with a 16x2 I2C LCD for local display of readings and a piezoelectric buzzer for immediate audible alerts.

The hardware resources also included the necessary power supply and wireless connectivity for cloud communication. A total of ten (10) sensor nodes were prepared for deployment across five (5) selected households, with two devices assigned per household for monitoring high-risk areas such as kitchens and garages. These hardware resources enabled the researchers to develop a functional prototype capable of real-time fire and gas leak monitoring in a residential setting.

**Software Methodology**  
	The researchers adopted the Agile software development methodology, specifically the Scrum framework, in the development of the proposed H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts. Scrum was selected because it provides an iterative and incremental approach to software development, making it suitable for projects that require continuous testing, refinement, and integration of both hardware and software components.

Scrum emphasizes collaboration, adaptability, and continuous improvement throughout the development process. In this methodology, development tasks are divided into short, time-boxed iterations called sprints, which usually span two to four weeks. During each sprint, the researchers focused on a specific set of deliverables, such as sensor integration, cloud communication, real-time alert transmission, mobile application development, dashboard monitoring, and incident management features. At the end of each sprint, a working increment of the system was evaluated and improved based on testing results and project requirements.

In the development of H-Fire, Scrum enabled the researchers to systematically manage the project by organizing tasks into the product backlog, planning the objectives for each sprint, conducting continuous development and testing, and reviewing the completed outputs after every cycle. This approach allowed the researchers to detect issues early, apply necessary refinements, and ensure that the system’s features were aligned with the objectives of the study.

Through the Scrum framework, the researchers were able to incrementally develop the H-Fire system, beginning with the initial planning and requirement analysis stages, followed by hardware integration using the ESP32, MQ-2 gas sensor, and KY-026 flame sensor, and continuing through the development of the Resident App, Admin App, cloud database integration, and real-time notification mechanisms. The use of Scrum contributed to the efficient and organized development of a functional, responsive, and user-centered monitoring system.

**Figure 2**  
*Scrum Framework of Agile Software Development*

**Development and Testing**  
	The development and testing phase is a critical part of the study because it involves the actual construction of the proposed system and the evaluation of its functionality, reliability, and overall performance. In this research, the development of H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts followed an iterative process guided by the Agile methodology, specifically the Scrum framework. This approach allowed the researchers to continuously refine the system through incremental improvements while ensuring that both user requirements and technical specifications were achieved.

During the development phase, the researchers focused on integrating both hardware and software components to create a fully functional system. The hardware development involved the assembly and configuration of the ESP32 microcontroller, MQ-2 gas sensor, KY-026 flame sensor, 16x2 I2C LCD, and piezoelectric buzzer. These components were responsible for detecting hazardous environmental conditions, displaying local readings, and providing immediate audible alerts. On the other hand, the software development included programming the ESP32 firmware, establishing MQTT-based communication through HiveMQ Cloud, configuring the Supabase database, developing the Node.js bridge, and building the Resident App and Admin App using React Native and Expo SDK. The integration of these components enabled seamless communication between the physical sensor nodes and the cloud-based mobile monitoring system.

The development process was carried out in phases or sprints, with each sprint focusing on specific system functions such as sensor calibration, telemetry transmission, push notification delivery, dashboard visualization, incident logging, and user interface improvement. After each sprint, the researchers evaluated the working outputs and made the necessary refinements based on observed issues, test results, and system requirements. This iterative process helped improve system performance, reduce development errors, and ensure that the final system met the intended objectives of the study.

Following the development phase, comprehensive testing procedures were conducted to evaluate the effectiveness and reliability of the system. The researchers performed unit testing to verify the functionality of individual components, such as the MQ-2 sensor, KY-026 sensor, LCD display, buzzer alarm, PIN authentication, push notification mechanism, and mobile dashboard features. This was followed by integration testing, where the communication between the ESP32 sensor nodes, HiveMQ Cloud, Node.js bridge, Supabase backend, and mobile applications was assessed to ensure proper data flow and real-time synchronization. Finally, system testing was carried out to evaluate the overall behavior of the complete H-Fire system under simulated hazard conditions.

To further validate the system, the researchers conducted test scenarios involving role-based PIN authentication, real-time dashboard monitoring, live community map visualization, incident acknowledgment and resolution, incident log filtering, HOA PIN management, and community-wide data visibility for authorized administrators. These tests were designed to measure the system’s accuracy, response time, access control, and reliability in delivering alerts and monitoring data. The results of these tests were analyzed, and necessary improvements were applied to further enhance the performance of the system.

Through a thorough development and testing process, the researchers ensured that the proposed H-Fire system operates efficiently, accurately, and reliably in detecting fire and gas-related hazards. This phase played a significant role in verifying that the system meets its intended purpose of providing real-time hazard monitoring, cloud-based data management, and emergency alerting for residential communities.

**Sprint Planning and Backlog Creation**  
**Figure 4**  
*Sprint planning and backlog creation*

| Sprint Planning and Backlog Creation |  |  |
| ----- | ----- | :---: |
| **TO-DO LIST** User Interface Design Resident App Development  Admin App Development  Live Community Map  Incident Log Module  Push Notification System  Role-Based PIN Authentication  | **IN PROGRESS** Chapter 1–3 Documentation Sensor Integration  MQTT Communication Setup  Supabase Database Configuration  Node.js Bridge Development  Dashboard Development  Testing and Debugging  | **DONE**  |

Figure  illustrates the sprint planning and backlog creation used by the researchers in the development of the H-Fire system. The figure presents the major project tasks classified into three categories: To-Do List, In Progress, and Done. The To-Do List contains the remaining features and modules to be developed, such as the Resident App, Admin App, Live Community Map, Incident Log Module, Push Notification System, and Role-Based PIN Authentication. The In Progress column represents the tasks currently being worked on by the researchers, including sensor integration, MQTT communication setup, Supabase database configuration, Node.js bridge development, dashboard development, and testing activities. The Done column indicates the tasks already completed, such as the project title proposal, requirement analysis, initial research, related literature review, and system planning.

Through sprint planning and backlog management, the researchers were able to organize development tasks systematically, monitor ongoing progress, and identify the remaining modules needed to complete the H-Fire system. This process helped ensure that the project remained aligned with its objectives and that each sprint contributed a functional improvement to the system.

**Sprint Review**

The researchers present the outputs developed during Sprints 1 to 4 using the Scrum Framework of Agile Software Development. These outputs include completed features such as sensor integration, real-time monitoring, mobile alert notifications, dashboard functions, and initial testing results. The sprint review enabled the researchers to evaluate system progress, identify necessary improvements, and ensure that the developed functionalities met the intended requirements of the H-Fire system.

**Table 5**  
*Sprint 1*

| Weeks | Description |  |
| :---- | :---- | :---- |
| Week 1 |  | Sprint planning, initial data gathering, and project title proposal  |
| Week 2 |  | Daily Scrum meetings, continued data gathering, and documentation of Chapters 1 to 3  |

Table 5 presents the activities completed during Sprint 1 of the H-Fire project using the Scrum Framework of Agile Software Development. During this sprint, the researchers focused on the initial planning stage of the study, including data gathering, documentation, and preparation of the project title proposal. Sprint 1 covered a total duration of two (2) weeks and served as the foundation for the succeeding development activities. 	

**Table 6**

*Sprint 2*

| Weeks | Description |  |
| :---- | :---- | :---- |
| Week 3 |  | Project work, continued data gathering, documentation, and title defense preparation  |
| Week 4-5 |  | Project work, Daily Scrum meetings, continued data gathering, documentation, and consultation with the course adviser  |

Table 6 presents the activities completed during **Sprint 2** of the H-Fire project using the Scrum Framework of Agile Software Development. In this sprint, the researchers continued project planning, documentation, and consultation activities while preparing for the title defense and refining the initial direction of the proposed system. Sprint 2 was carried out over a period of **three (3) weeks**.

***Table 7***  
*Sprint 3*

| Weeks | Description |  |
| :---- | :---- | :---- |
| Week 6 |  | Data gathering, requirement refinement, and preparation for system development  |
| Week 7-8 |  | Project work, Daily Scrum meetings, system development, data gathering, and documentation  |
| Week 9 |  | Data gathering, documentation, and sprint review meeting  |

	Table 7 presents the activities completed during Sprint 3 of the H-Fire project using the Scrum Framework of Agile Software Development. During this sprint, the researchers focused on preparing for the actual system development, refining requirements, and continuing project documentation. The sprint also included Daily Scrum meetings and a sprint review to assess progress and identify necessary improvements. Sprint 3 was conducted over a duration of four (4) weeks. 

**Table 8**  
*Sprint 4*

| Weeks | Description |  |
| :---- | :---- | :---- |
| Week 10 |  | Data gathering, documentation, and continuation of system development  |
| Week 11 |  | Project work, Daily Scrum meetings, feature development, and documentation  |
| Week 12 |  | Data gathering, documentation, and sprint review meeting  |

	Table 8 presents the activities completed during Sprint 4 of the H-Fire project using the Scrum Framework of Agile Software Development. In this sprint, the researchers continued the development of system features, carried out project work, and maintained documentation while conducting Daily Scrum meetings and sprint review activities. Sprint 4 covered a total of three (3) weeks and contributed to the continued refinement of the H-Fire system.

**Increment**

The researchers present the system increments developed across Sprints 1 to 4 using the Scrum Framework of Agile Software Development. Each increment represents a functional improvement in the development of the H-Fire system, including enhancements in sensor integration, real-time monitoring, mobile alert notifications, dashboard features, and other core system functions. These incremental outputs demonstrate the continuous progress of the project and the readiness of the system for further refinement and deployment.

Through incremental development, the researchers were able to gradually build, test, and improve the major components of the H-Fire system. This approach ensured that each completed sprint contributed a usable and measurable enhancement to the overall system. As a result, the incremental outputs served as evidence of the system’s steady development and alignment with the intended objectives of the study.

**Testing Phase**  
	The researchers conducted the testing phase of the H-Fire system during and after Sprints 1 to 4 using the Scrum Framework of Agile Software Development. This phase included unit testing, integration testing, and system testing to evaluate the performance and reliability of the proposed system. The testing procedures focused on the accuracy of sensor detection, the responsiveness of real-time monitoring, the delivery of mobile alerts, and the overall functionality of the integrated hardware and software components.

Unit testing was performed to verify the functionality of individual components, such as the MQ-2 gas sensor, KY-026 flame sensor, LCD display, buzzer alarm, PIN authentication, and push notification mechanisms. Integration testing was then conducted to assess the communication and synchronization among the ESP32 sensor nodes, HiveMQ Cloud, Node.js bridge, Supabase backend, and the Resident and Admin mobile applications. Lastly, system testing was carried out to evaluate the complete behavior of H-Fire under simulated hazard conditions and actual usage scenarios.

The testing process ensured that the proposed system functions accurately, reliably, and according to the required specifications prior to deployment. Through these procedures, the researchers were able to identify issues, apply refinements, and confirm that the H-Fire system was capable of delivering real-time monitoring and emergency alerts for residential fire and gas leak incidents.

**System Case**	  
	The researchers present the system use case of H-Fire: An IoT-Based Fire and Gas Leak Monitoring System with Cross-Platform Mobile Alerts. The use case illustrates the interaction between the users and the system, including monitoring sensor data, receiving real-time alerts, viewing incident records, and managing system settings based on assigned roles. It also shows how the system responds when hazardous conditions such as gas leaks or flame detection are identified by the sensor nodes.

The system use case highlights the functions available to different users of the H-Fire system. Residents are able to monitor their registered devices, receive emergency notifications, and manage their household location settings. HOA Managers are granted monitoring access to community-wide device data and incident alerts, while Administrators are given full control over incident resolution, dashboard monitoring, and security-related settings. Through this use case, the researchers were able to present how the system supports real-time hazard awareness, access control, and coordinated emergency response within the residential community.

**Table 9**  
*Admin Page Test Plan*

| Case No.  | Test Plan | Description |
| :---- | :---- | :---- |
| 1.0 | Login | Ensure that administrators can log in using valid credentials and are denied access when incorrect credentials are entered. Verify that the system securely handles authentication and prevents unauthorized access. |
| 2.0 | PIN Authentication | Validate that role-based PIN authentication functions correctly. Ensure that Admin and HOA users can access their respective dashboards, while invalid PIN entries are rejected. |
| 3.0 | Dashboard  | Confirm that the dashboard loads properly and displays real-time data, including system status such as total devices, fire alerts, and offline units. Ensure that sensor readings are accurate and updated in real time.Expiration Notices, and Document Count. |
| 4.0 | CommandCentre Monitoring | Check access to the library module. Verify the functionality of document listings, search/filter options, and individual document views.  |
| 5.0 | Community Map | Check the functionality of the map module. Ensure that device locations are correctly displayed and color-coded based on status (Safe, Warning, Fire). |
| 6.0 | Incident Management | Validate that the Admin can respond to incidents by accessing the emergency module. Ensure that incidents can be resolved and properly updated in the system.. |
| 7.0 | Incident Logs | Confirm that the system correctly records and displays both active and resolved incidents. Ensure filtering options work properly. |
| 8.0 | Settings / PIN Management | Verify that the Admin can update system settings, including changing the HOA PIN. Ensure that changes are saved and applied securely. |
| 9.0 | Data Visibility | Ensure that the Admin can view all connected devices and households. Verify that system-wide data is accessible only to authorized users. |

**Table 9 presents the Admin Page Test Plan used by the researchers to evaluate the major administrative functions of the H-Fire system. The test cases focus on authentication, dashboard monitoring, community map visualization, incident handling, settings management, and system-wide data access. These tests were designed to verify whether the administrative module of the system operates accurately, securely, and in accordance with the intended functional requirements of the study.** 

**Test Case 1.0: Admin Login**   
**Procedure:** 

* Open the H-Fire Admin App.  
* Enter a valid email and password.  
* Click the Login button.  
* Repeat the process using invalid credentials.

**Expected Result:** 

* The system grants access when valid credentials are entered.  
* The system denies access when invalid credentials are entered.  
* An error message is displayed for incorrect login attempts.

**Actual Result:**   
**Figure 5**  
*Admin Login Screen for H-Fire* 

Figure 5 shows the login screen of the H-Fire Admin App, where the administrator enters valid credentials to access the dashboard and system monitoring functions.

**Test Case 2.0: PIN Authentication**   
**Procedure:** 

* Enter a valid Admin PIN.  
* Enter a valid HOA Manager PIN.  
* Enter an incorrect PIN.

**Actual Result:** 

**Figure 6**  
*PIN Authentication* 

Figure 6 shows the role-based PIN authentication process of H-Fire, where the system verifies whether the entered PIN corresponds to the Admin or HOA Manager role. 

**Test Case 3.0: Dashboard**   
**Procedure:**

* Log in to the Admin App.  
* Open the dashboard.  
* Observe the summary cards for total devices, fire alerts, and offline devices.  
* Compare the displayed readings with the current system status.

**Expected Output:** 

* The dashboard loads successfully.  
* The summary cards display correct and updated values.  
* Real-time monitoring information matches the actual device status.

**Actual Result:** 

**Figure 7**  
*Admin Dashboard* 

Figure 7 shows the H-Fire Admin Dashboard displaying real-time monitoring information such as household status, incident counts, and overall system activity. 

**Test Case 4.0: Command Centre Monitoring**   
**Procedure:** 

* Log in as Admin or HOA Manager.  
* Open the Command Centre.  
* Review the displayed community-wide monitoring information.

**Expected Output:** 

* The Command Centre loads properly.  
* The system displays current household status, alerts, and summaries.  
* Monitoring information is accessible according to the user’s authorized role.

**Actual Result:** 

**Figure 8**  
*Command Centre Monitoring* 

Figure 8 shows the Command Centre of H-Fire, where authorized users can view centralized monitoring information from connected households and devices. 

**Test Case 5.0: Community Map**   
**Procedure:** 

* Open the Community Map module.  
* Observe the markers displayed on the map.  
* Check whether the colors correspond to Safe, Warning, and Fire conditions.

**Expected Output:** 

* Device locations appear on the map correctly.  
* Marker colors reflect the current hazard status.  
* The map updates according to the latest system data.

**Actual Result:** 

**Figure 9**  
*Community Map* 

Figure 9 shows the H-Fire Community Map, which displays the locations of registered households and their current hazard status through color-coded markers. 

**Test Case 6.0: Incident Management**   
**Procedure:** 

* Trigger or open an active incident.  
* Access the emergency module.  
* Select the option to acknowledge or resolve the incident.

**Expected Output:** 

* The system opens the incident details properly.  
* The Admin can acknowledge and resolve incidents.  
* Incident status is updated in the system after the selected action.

**Actual Result:** 

**Figure 10**  
*Incident Management* 

Figure 10 shows the incident management module of H-Fire, where authorized users can monitor active emergencies and perform response actions. 

**Test Case 7.0: Incident Logs**   
**Procedure:** 

* Open the Incident Log module.  
* Apply the Active filter.  
* Apply the Resolved filter.

**Expected Output:** 

* The system displays active incidents when the Active filter is selected.  
* The system displays resolved incidents when the Resolved filter is selected.  
* Incident records are stored and retrieved correctly.

**Actual Result:** 

**Figure 11**  
*Incident Logs* 

Figure 11 shows the Incident Log section of H-Fire, where active and resolved incidents are recorded and can be filtered for monitoring and review.

## **Test Case 8.0: Settings / PIN Management**

**Procedure:**

* Log in as Admin.  
* Open the Settings module.  
* Enter a new HOA Manager PIN.  
* Save the changes.

**Expected Output:** 

* The system updates the HOA Manager PIN successfully.  
* The old PIN no longer grants access.  
* The new PIN is applied securely in the system.

**Actual Result:** 

**Figure 12**  
*Settings / PIN Management* 

Figure 12 shows the settings module of H-Fire, where the administrator can update system configurations such as the HOA Manager PIN. 

**Test Case 9.0: Data Visibility**   
**Procedure:** 

* Log in as Admin.  
* Open the device list or monitoring dashboard.  
* Review the visible household and device data.

**Expected Output:** 

* The Admin can view all connected households and devices.  
* Data from all registered households is displayed correctly.  
* Access remains restricted to authorized users only.

**Actual Result:**   
**Figure 13**  
*Data Visibility* 

Figure 13 shows the H-Fire monitoring view where the Admin can access community-wide household and device data for centralized oversight. 

	

CONTENT