# Information Security and Business Continuity Policy
# سياسة أمن المعلومات واستمرارية الأعمال

| | |
| --- | --- |
| Institution | Sahaab Cooperative Insurance · سحاب للتأمين التعاوني |
| Code | POL-ISC-008 |
| Version | 3.0 |
| Owner | Information Security · أمن المعلومات |
| Approved by | Board Risk Committee · لجنة المخاطر المنبثقة من المجلس |
| Effective | 2025-03-01 |
| Next review | 2026-03-01 |
| Regulators | NCA, IA |
| Clauses | 18 |

> Controls protecting the confidentiality, integrity and availability of policy, claim and medical data, and how the company keeps its critical insurance services running through disruption.
>
> الضوابط التي تحمي سرية بيانات الوثائق والمطالبات والبيانات الصحية وسلامتها وتوافرها، وكيف تحافظ الشركة على استمرار خدماتها التأمينية الحرجة أثناء التعطل.

## 1. Access and Protection of Data — الوصول وحماية البيانات

### 1.1 Least privilege — أقل صلاحية

Access is granted on the principle of least privilege and only for as long as the business need exists.

تُمنح الصلاحيات وفق مبدأ أقل صلاحية ولمدة وجود الحاجة العملية فقط.

`tags: infosec, access`

### 1.2 Multi-factor authentication — المصادقة متعددة العوامل

Multi-factor authentication is mandatory for remote access, for privileged accounts and for access to the policy administration, claims and medical systems.

المصادقة متعددة العوامل إلزامية للوصول عن بُعد وللحسابات المميزة وللوصول إلى أنظمة إدارة الوثائق والمطالبات والأنظمة الطبية.

`tags: infosec, access, mfa`

### 1.3 Access review — مراجعة الصلاحيات

The system owner reviews user access rights every ninety days and privileged access every thirty days, and the review is evidenced.

يراجع مالك النظام صلاحيات المستخدمين كل تسعين يوماً والصلاحيات المميزة كل ثلاثين يوماً، وتُوثق المراجعة.

`tags: infosec, access, review, timeframe`

### 1.4 Joiners, movers and leavers — الالتحاق والنقل والمغادرة

Access is revoked on the same working day an employee leaves the company or changes role, and the access of an intermediary is revoked on the day the agreement ends.

تُلغى الصلاحيات في يوم العمل ذاته الذي يغادر فيه الموظف الشركة أو يتغير فيه دوره، وتُلغى صلاحيات الوسيط في يوم انتهاء اتفاقيته.

`tags: infosec, access, hr, intermediaries, timeframe`

### 1.5 Encryption — التشفير

Policy, claim and medical data is encrypted in transit over public networks and at rest, and encryption keys are managed in a hardware security module.

تُشفَّر بيانات الوثائق والمطالبات والبيانات الصحية أثناء نقلها عبر الشبكات العامة وأثناء تخزينها، وتُدار مفاتيح التشفير في وحدة أمان مادية.

`tags: infosec, encryption, keys, medical`

### 1.6 Logging — تسجيل الأحداث

Security-relevant events are logged centrally, protected from alteration, and retained for at least eighteen months.

تُسجل الأحداث ذات الأثر الأمني مركزياً وتُحمى من التعديل وتُحفظ لمدة ثمانية عشر شهراً على الأقل.

`tags: infosec, logging, retention, audit-trail`

## 2. Threats, Change and Incidents — التهديدات والتغيير والحوادث

### 2.1 Vulnerability management — إدارة الثغرات

Critical vulnerabilities are remediated within fifteen days of discovery and high vulnerabilities within thirty days; an exception requires the approval of the head of Information Security.

تُعالج الثغرات الحرجة خلال خمسة عشر يوماً من اكتشافها والثغرات المرتفعة خلال ثلاثين يوماً، ويتطلب أي استثناء موافقة رئيس أمن المعلومات.

`tags: infosec, vulnerability, timeframe`

### 2.2 Penetration testing — اختبار الاختراق

The policyholder application, the quotation engine and every internet-facing service are penetration tested at least once a year and after every major change.

يُجرى اختبار اختراق لتطبيق حملة الوثائق ومحرك التسعير وكل خدمة متاحة عبر الإنترنت مرة في السنة على الأقل وبعد كل تغيير جوهري.

`tags: infosec, testing, timeframe`

### 2.3 Change management — إدارة التغيير

No change is deployed to production without an approved change record, a test result and a rollback plan.

لا يُنشر أي تغيير في بيئة الإنتاج دون سجل تغيير معتمد ونتيجة اختبار وخطة تراجع.

`tags: infosec, change, evidence`

### 2.4 Test data — بيانات الاختبار

Policyholder, claim and medical data is not copied into a development or test environment unless it has been masked.

لا تُنسخ بيانات حملة الوثائق والمطالبات والبيانات الصحية إلى بيئة تطوير أو اختبار ما لم تُخفَ معالمها.

`tags: infosec, environments, pdpl, medical`

### 2.5 Incident response — الاستجابة للحوادث

A cyber incident is declared and classified within four hours of detection, is reported to the National Cybersecurity Authority in line with the applicable reporting requirements, and the Insurance Authority is informed where a policyholder service or claim data is affected.

يُعلن الحادث السيبراني ويُصنف خلال أربع ساعات من اكتشافه، ويُبلَّغ به الهيئة الوطنية للأمن السيبراني وفق متطلبات الإبلاغ السارية، وتُبلَّغ هيئة التأمين متى تأثرت خدمة لحملة الوثائق أو بيانات مطالبات.

`tags: infosec, incident, nca, ia, reporting, timeframe`

## 3. Business Continuity — استمرارية الأعمال

### 3.1 Business impact analysis — تحليل أثر الأعمال

A business impact analysis is performed once a year to identify the critical insurance services and the recovery time objective of each.

يُجرى تحليل أثر الأعمال مرة في السنة لتحديد الخدمات التأمينية الحرجة وهدف زمن التعافي لكل منها.

`tags: bcm, bia, timeframe`

### 3.2 Recovery objectives — أهداف التعافي

The motor claim notification service and the medical pre-approval service have a recovery time objective not exceeding two hours, and policy issuance a recovery time objective not exceeding eight hours.

يكون هدف زمن التعافي لخدمة الإبلاغ عن مطالبات المركبات وخدمة الموافقات الطبية المسبقة بما لا يتجاوز ساعتين، ولخدمة إصدار الوثائق بما لا يتجاوز ثماني ساعات.

`tags: bcm, rto, claims, medical, timeframe`

### 3.3 Alternate site — الموقع البديل

A geographically separate alternate processing site is maintained inside the Kingdom and kept in a state of readiness.

يُحتفظ بموقع معالجة بديل منفصل جغرافياً داخل المملكة ويبقى في حالة جاهزية.

`tags: bcm, site, residency`

### 3.4 Annual exercise — التمرين السنوي

A full continuity exercise covering the claims and policy administration systems is conducted at least once every twelve months, and its scope, participants, results and remediation actions are documented and retained for five years.

يُنفذ تمرين استمرارية كامل يشمل أنظمة المطالبات وإدارة الوثائق مرة واحدة على الأقل كل اثني عشر شهراً، ويُوثق نطاقه والمشاركون فيه ونتائجه وإجراءات المعالجة وتُحفظ لمدة خمس سنوات.

`tags: bcm, testing, evidence, retention, timeframe`

### 3.5 Reporting a disruption — الإبلاغ عن التعطل

A disruption that prevents policyholders from notifying a claim or obtaining a medical approval is reported to the Insurance Authority within the period set by the applicable instructions, together with the expected time of restoration.

يُبلَّغ عن أي تعطل يمنع حملة الوثائق من الإبلاغ عن مطالبة أو الحصول على موافقة طبية إلى هيئة التأمين خلال المدة التي تحددها التعليمات السارية، مع بيان الوقت المتوقع لعودة الخدمة.

`tags: bcm, reporting, ia, timeframe`

## 4. Governance and Awareness — الحوكمة والتوعية

### 4.1 Awareness — التوعية

Every employee completes information security awareness training on joining and once every twelve months thereafter, and a simulated phishing exercise is run at least twice a year.

يُكمل كل موظف تدريب التوعية بأمن المعلومات عند الالتحاق ومرة كل اثني عشر شهراً بعد ذلك، ويُنفذ تمرين تصيّد محاكى مرتين في السنة على الأقل.

`tags: infosec, training, hr, timeframe`

### 4.2 Independent review — المراجعة المستقلة

The cybersecurity and continuity framework is reviewed independently at least once every twenty-four months, and the findings are presented to the Board Risk Committee with a remediation plan.

يُراجع إطار الأمن السيبراني واستمرارية الأعمال مراجعة مستقلة مرة واحدة على الأقل كل أربعة وعشرين شهراً، وتُعرض الملحوظات على لجنة المخاطر المنبثقة من المجلس مع خطة معالجة.

`tags: infosec, bcm, audit, governance, review`
