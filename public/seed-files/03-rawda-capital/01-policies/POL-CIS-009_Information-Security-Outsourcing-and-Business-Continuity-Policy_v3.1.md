# Information Security, Outsourcing and Business Continuity Policy
# سياسة أمن المعلومات والإسناد واستمرارية الأعمال

| | |
| --- | --- |
| Institution | Rawda Capital · روضة كابيتال |
| Code | POL-CIS-009 |
| Version | 3.1 |
| Owner | Information Security · أمن المعلومات |
| Approved by | Board Risk Committee · لجنة المخاطر المنبثقة من المجلس |
| Effective | 2025-01-20 |
| Next review | 2026-01-20 |
| Regulators | NCA, CMA |
| Clauses | 17 |

> Protecting the firm’s systems and client data, controlling what is outsourced, and keeping critical market services running through disruption.
>
> حماية أنظمة المؤسسة وبيانات العملاء، وضبط ما يُسند إلى الغير، والحفاظ على استمرار الخدمات السوقية الحرجة أثناء التعطل.

## 1. Information Security — أمن المعلومات

### 1.1 Least privilege — أقل صلاحية

Access to the order management, custody and client data systems is granted on the principle of least privilege, is reviewed by the system owner every ninety days, and privileged access is reviewed every thirty days.

تُمنح صلاحيات الوصول إلى أنظمة إدارة الأوامر والحفظ وبيانات العملاء وفق مبدأ أقل صلاحية، ويراجعها مالك النظام كل تسعين يوماً، وتُراجع الصلاحيات المميزة كل ثلاثين يوماً.

`tags: infosec, access, review, timeframe`

### 1.2 Multi-factor authentication — المصادقة متعددة العوامل

Multi-factor authentication is mandatory for all remote access, for privileged accounts and for any access to the trading or custody systems.

المصادقة متعددة العوامل إلزامية لجميع حالات الوصول عن بُعد وللحسابات المميزة ولأي وصول إلى أنظمة التداول أو الحفظ.

`tags: infosec, access, mfa`

### 1.3 Segregation of duties in systems — فصل المهام داخل الأنظمة

No single user may both create and release a payment or a securities transfer, and the system enforces this separation rather than relying on procedure alone.

لا يجوز أن ينفرد مستخدم واحد بإنشاء وإطلاق أمر دفع أو تحويل أوراق مالية، ويفرض النظام هذا الفصل تقنياً لا اعتماداً على الإجراء وحده.

`tags: infosec, segregation, access, controls`

### 1.4 Encryption and key management — التشفير وإدارة المفاتيح

Client and personal data is encrypted in transit and at rest, and encryption keys are managed in a hardware security module with access restricted to named custodians.

تُشفَّر بيانات العملاء والبيانات الشخصية أثناء النقل وأثناء التخزين، وتُدار مفاتيح التشفير في وحدة أمان مادية يقتصر الوصول إليها على أمناء محددين بالاسم.

`tags: infosec, encryption, keys, pdpl`

### 1.5 Logging — تسجيل الأحداث

Access, order and transfer events are logged centrally, protected from alteration and retained for not less than eighteen months; where a log forms part of an order record or a client asset record it is retained for ten years.

تُسجَّل أحداث الوصول والأوامر والتحويلات مركزياً وتُحمى من التعديل وتُحفظ لمدة لا تقل عن ثمانية عشر شهراً، وإذا شكّل السجل جزءاً من سجل أمر أو سجل أصول عميل حُفظ عشر سنوات.

`tags: infosec, logging, retention, audit-trail`

## 2. Resilience and Incident Response — الصمود والاستجابة للحوادث

### 2.1 Vulnerability management — إدارة الثغرات

Critical vulnerabilities are remediated within fifteen days of discovery and high vulnerabilities within thirty days, and any exception requires the written acceptance of the Head of Risk.

تُعالج الثغرات الحرجة خلال خمسة عشر يوماً من اكتشافها والثغرات المرتفعة خلال ثلاثين يوماً، ويتطلب أي استثناء قبولاً كتابياً من رئيس إدارة المخاطر.

`tags: infosec, vulnerability, timeframe, approval`

### 2.2 Penetration testing — اختبار الاختراق

Internet-facing services and the trading platform are penetration tested at least once every twelve months and after every major change, and the findings are tracked to closure.

تُجرى اختبارات اختراق للخدمات المتاحة عبر الإنترنت ولمنصة التداول مرة على الأقل كل اثني عشر شهراً وبعد كل تغيير جوهري، وتُتابع الملاحظات حتى إغلاقها.

`tags: infosec, testing, timeframe`

### 2.3 Incident classification and notification — تصنيف الحوادث والإشعار بها

A cyber incident affecting trading, client assets or client data is classified within four hours of detection and notified to the National Cybersecurity Authority and to the Capital Market Authority in accordance with the applicable reporting requirements, and affected clients are informed within seventy-two hours.

يُصنَّف الحادث السيبراني الذي يؤثر على التداول أو أصول العملاء أو بياناتهم خلال أربع ساعات من اكتشافه، ويُبلَّغ به الهيئة الوطنية للأمن السيبراني وهيئة السوق المالية وفق متطلبات الإبلاغ السارية، ويُبلَّغ العملاء المتأثرون خلال اثنتين وسبعين ساعة.

`tags: infosec, incident, nca, cma, reporting, timeframe`

### 2.4 Change management — إدارة التغيير

No change to a trading, custody or valuation system is deployed without an approved change record, evidence of testing and a rollback plan, and an emergency change is ratified within two working days.

لا يُنشر أي تغيير على أنظمة التداول أو الحفظ أو التقييم دون سجل تغيير معتمد وأدلة اختبار وخطة تراجع، ويُعتمد التغيير الطارئ لاحقاً خلال يومي عمل.

`tags: infosec, change, evidence, approval`

## 3. Outsourcing — الإسناد

### 3.1 Material outsourcing — الإسناد الجوهري

Outsourcing of order routing, custody operations, fund administration or data centre services is treated as material, requires the approval of the Board Risk Committee, and is notified to the Authority before the contract is signed.

يُعد إسناد توجيه الأوامر أو عمليات الحفظ أو إدارة الصناديق أو خدمات مركز البيانات إسناداً جوهرياً، ويتطلب موافقة لجنة المخاطر المنبثقة من المجلس، ويُشعَر به الهيئة قبل توقيع العقد.

`tags: outsourcing, approval, cma, governance`

### 3.2 Due diligence on the provider — العناية الواجبة تجاه المزود

The provider’s financial standing, security posture, subcontracting chain and the concentration risk it creates are assessed and documented before selection, and reviewed at least annually thereafter.

يُقيَّم ويُوثق المركز المالي للمزود ووضعه الأمني وسلسلة تعاقده من الباطن ومخاطر التركز الناشئة عنه قبل اختياره، ويُراجع ذلك سنوياً على الأقل بعد ذلك.

`tags: outsourcing, due-diligence, review`

### 3.3 Contract requirements — متطلبات العقد

Every outsourcing contract states service levels, confidentiality, ownership of data, consent to sub-outsourcing, audit and regulatory access rights and exit arrangements, and responsibility for the outsourced activity remains with the firm.

يبين كل عقد إسناد مستويات الخدمة والسرية وملكية البيانات والموافقة على التعاقد من الباطن وحقوق التدقيق ووصول الجهات الرقابية وترتيبات الخروج، وتبقى المسؤولية عن النشاط المسند على المؤسسة.

`tags: outsourcing, contract, audit, cma`

### 3.4 Location of data — موقع البيانات

Client and personal data processed by a provider remains inside the Kingdom unless a written regulatory approval states otherwise, and the location is confirmed in the annual provider review.

تبقى بيانات العملاء والبيانات الشخصية التي يعالجها المزود داخل المملكة ما لم تنص موافقة رقابية كتابية على غير ذلك، ويُتحقق من الموقع في المراجعة السنوية للمزود.

`tags: outsourcing, residency, pdpl, review`

## 4. Business Continuity — استمرارية الأعمال

### 4.1 Business impact analysis — تحليل أثر الأعمال

A business impact analysis is performed every twelve months and identifies the critical services, which include order execution, client asset reconciliation, fund valuation and settlement with the Securities Clearing Center.

يُجرى تحليل أثر الأعمال كل اثني عشر شهراً ويحدد الخدمات الحرجة، ومنها تنفيذ الأوامر ومطابقة أصول العملاء وتقييم الصناديق والتسوية مع مركز مقاصة الأوراق المالية.

`tags: bcm, bia, timeframe`

### 4.2 Recovery objectives — أهداف التعافي

The recovery time objective for order execution and settlement on a trading day does not exceed two hours, and the recovery point objective does not exceed fifteen minutes.

لا يتجاوز هدف زمن التعافي لتنفيذ الأوامر والتسوية في يوم التداول ساعتين، ولا يتجاوز هدف نقطة التعافي خمس عشرة دقيقة.

`tags: bcm, rto, timeframe`

### 4.3 Alternate site and exercises — الموقع البديل والتمارين

A geographically separate alternate site is kept in a state of readiness, a full exercise covering a complete trading day is run at least once every twelve months, and the evidence is retained for five years.

يُحتفظ بموقع بديل منفصل جغرافياً في حالة جاهزية، ويُنفَّذ تمرين كامل يغطي يوم تداول كاملاً مرة على الأقل كل اثني عشر شهراً، وتُحفظ أدلته خمس سنوات.

`tags: bcm, testing, evidence, retention`

### 4.4 Reporting a disruption — الإبلاغ عن التعطل

A disruption that prevents the firm from executing client orders or from settling on a trading day is reported to the Authority on the day it occurs, and clients are informed through the channel agreed with them.

يُبلَّغ الهيئة في يوم وقوعه بأي تعطل يمنع المؤسسة من تنفيذ أوامر العملاء أو من التسوية في يوم تداول، ويُبلَّغ العملاء عبر القناة المتفق عليها معهم.

`tags: bcm, reporting, cma, client`
