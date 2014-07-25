'use strict';

angular.module('deckApp')
  .constant('listOfTasks',

    [{"id":4,"name":"orca-job-07512dd0-87f9-44f7-ad62-87b06e94f2f9","status":"COMPLETED","variables":[{"key":"deploy.application","value":"oort"},{"key":"deploy.server.groups","value":{"us-east-1":["oort-main-v006"]}},{"key":"deploy.stack","value":"main"},{"key":"kato.task.id","value":{"id":"gsvi5"}},{"key":"deploy.availabilityZones","value":{"us-east-1":[]}},{"key":"bake.baseOs","value":"ubuntu"},{"key":"bake.baseLabel","value":"release"},{"key":"deploy.account.name","value":"prod"},{"key":"deploy.subnetType","value":"internal"},{"key":"bake.type","value":"bake"},{"key":"deploy.capacity","value":{"min":3,"max":3,"desired":3}},{"key":"deploy.instanceType","value":"c3.2xlarge"},{"key":"deploy.loadBalancers","value":["oort-main-frontend","oort-mcetest-external"]},{"key":"deploy.type","value":"deploy"},{"key":"bake.region","value":"us-east-1"},{"key":"deploy.credentials","value":"prod"},{"key":"bake.user","value":"danw"},{"key":"deploy.securityGroups","value":["nf-infrastructure-vpc","nf-datacenter-vpc"]},{"key":"bake.ami","value":"ami-965a93fe"},{"key":"bake.status","value":{"id":"s-rcb22nahb94yabswxcrf9k8sm","state":"COMPLETED","resourceId":"b-2qhexp64ta8rab3gwjbgfdb4e8"}},{"key":"bake.package","value":"oort"}],"steps":[{"name":"orca-config-step","status":"COMPLETED","startTime":1406150851098,"endTime":1406150851102},{"name":"CreateBakeStep","status":"COMPLETED","startTime":1406150851108,"endTime":1406150851794},{"name":"MonitorBakeStep","status":"COMPLETED","startTime":1406150851801,"endTime":1406150851903},{"name":"CompletedBakeStep","status":"COMPLETED","startTime":1406150851911,"endTime":1406150852007},{"name":"CreateDeployStep","status":"COMPLETED","startTime":1406150852015,"endTime":1406150852392},{"name":"MonitorDeployStep","status":"COMPLETED","startTime":1406150852401,"endTime":1406150883814},{"name":"WaitForUpInstancesStep","status":"COMPLETED","startTime":1406150883834,"endTime":1406151252395}],"startTime":1406150851093,"endTime":1406151252399},{"id":6,"name":"orca-job-3732619a-4ed4-47cf-91ca-d2775a5f29a8","status":"FAILED","variables":[{"key":"deploy.application","value":"kato"},{"key":"deploy.server.groups","value":{"us-east-1":["kato-main-v029"]}},{"key":"deploy.stack","value":"main"},{"key":"kato.task.id","value":{"id":"8h2bsi"}},{"key":"deploy.availabilityZones","value":{"us-east-1":[]}},{"key":"bake.baseOs","value":"ubuntu"},{"key":"bake.baseLabel","value":"release"},{"key":"deploy.account.name","value":"prod"},{"key":"deploy.subnetType","value":"internal"},{"key":"bake.type","value":"bake"},{"key":"deploy.capacity","value":{"min":1,"max":1,"desired":1}},{"key":"deploy.instanceType","value":"m3.large"},{"key":"deploy.loadBalancers","value":["kato-main-frontend","kato-mcetest-external"]},{"key":"deploy.type","value":"deploy"},{"key":"bake.region","value":"us-east-1"},{"key":"deploy.credentials","value":"prod"},{"key":"bake.user","value":"danw"},{"key":"deploy.securityGroups","value":["nf-infrastructure-vpc","nf-datacenter-vpc"]},{"key":"bake.ami","value":"ami-7279b01a"},{"key":"bake.status","value":{"id":"s-2d4601mrt19w2930j2d9y85cm8","state":"COMPLETED","resourceId":"b-6qca3vfr7g9dfreyznwrn20v87"}},{"key":"bake.package","value":"kato"}],"steps":[{"name":"orca-config-step","status":"COMPLETED","startTime":1406167141926,"endTime":1406167141931},{"name":"CreateBakeStep","status":"COMPLETED","startTime":1406167141940,"endTime":1406167147470},{"name":"MonitorBakeStep","status":"COMPLETED","startTime":1406167147476,"endTime":1406167318123},{"name":"CompletedBakeStep","status":"COMPLETED","startTime":1406167318130,"endTime":1406167318232},{"name":"CreateDeployStep","status":"COMPLETED","startTime":1406167318244,"endTime":1406167319130},{"name":"MonitorDeployStep","status":"COMPLETED","startTime":1406167319138,"endTime":1406167361708},{"name":"WaitForUpInstancesStep","status":"FAILED","startTime":1406167361716,"endTime":1406167962651}],"startTime":1406167141921,"endTime":1406167962655},{"id":3,"name":"orca-job-6bfafc07-0c65-496a-973e-486e940f2923","status":"COMPLETED","variables":[{"key":"deploy.application","value":"oort"},{"key":"deploy.server.groups","value":{"us-east-1":["oort-main-v005"]}},{"key":"deploy.stack","value":"main"},{"key":"kato.task.id","value":{"id":"i9zwjv"}},{"key":"deploy.availabilityZones","value":{"us-east-1":[]}},{"key":"bake.baseOs","value":"ubuntu"},{"key":"bake.baseLabel","value":"release"},{"key":"deploy.account.name","value":"prod"},{"key":"deploy.subnetType","value":"internal"},{"key":"bake.type","value":"bake"},{"key":"deploy.capacity","value":{"min":3,"max":3,"desired":3}},{"key":"deploy.instanceType","value":"c3.2xlarge"},{"key":"deploy.loadBalancers","value":["oort-main-frontend"]},{"key":"deploy.type","value":"deploy"},{"key":"bake.region","value":"us-east-1"},{"key":"deploy.credentials","value":"prod"},{"key":"bake.user","value":"danw"},{"key":"deploy.securityGroups","value":["nf-infrastructure-vpc","nf-datacenter-vpc"]},{"key":"bake.ami","value":"ami-965a93fe"},{"key":"bake.status","value":{"id":"s-rcb22nahb94yabswxcrf9k8sm","state":"COMPLETED","resourceId":"b-2qhexp64ta8rab3gwjbgfdb4e8"}},{"key":"bake.package","value":"oort"}],"steps":[{"name":"orca-config-step","status":"COMPLETED","startTime":1406150013124,"endTime":1406150013129},{"name":"CreateBakeStep","status":"COMPLETED","startTime":1406150013140,"endTime":1406150013991},{"name":"MonitorBakeStep","status":"COMPLETED","startTime":1406150013999,"endTime":1406150014096},{"name":"CompletedBakeStep","status":"COMPLETED","startTime":1406150014104,"endTime":1406150014198},{"name":"CreateDeployStep","status":"COMPLETED","startTime":1406150014207,"endTime":1406150014515},{"name":"MonitorDeployStep","status":"COMPLETED","startTime":1406150014524,"endTime":1406150044828},{"name":"WaitForUpInstancesStep","status":"COMPLETED","startTime":1406150044837,"endTime":1406150434248}],"startTime":1406150013119,"endTime":1406150434252},{"id":5,"name":"orca-job-7459c9c7-9d2e-4340-b58f-80c0b92aebec","status":"COMPLETED","variables":[{"key":"deploy.application","value":"oort"},{"key":"deploy.server.groups","value":{"us-east-1":["oort-main-v007"]}},{"key":"deploy.stack","value":"main"},{"key":"kato.task.id","value":{"id":"nyp1ma"}},{"key":"deploy.availabilityZones","value":{"us-east-1":[]}},{"key":"bake.baseOs","value":"ubuntu"},{"key":"bake.baseLabel","value":"release"},{"key":"deploy.account.name","value":"prod"},{"key":"deploy.subnetType","value":"internal"},{"key":"bake.type","value":"bake"},{"key":"deploy.capacity","value":{"min":3,"max":3,"desired":3}},{"key":"deploy.instanceType","value":"c3.2xlarge"},{"key":"deploy.loadBalancers","value":["oort-main-frontend","oort-mcetest-external"]},{"key":"deploy.type","value":"deploy"},{"key":"bake.region","value":"us-east-1"},{"key":"deploy.credentials","value":"prod"},{"key":"bake.user","value":"danw"},{"key":"deploy.securityGroups","value":["nf-infrastructure-vpc","nf-datacenter-vpc"]},{"key":"bake.ami","value":"ami-965a93fe"},{"key":"bake.status","value":{"id":"s-rcb22nahb94yabswxcrf9k8sm","state":"COMPLETED","resourceId":"b-2qhexp64ta8rab3gwjbgfdb4e8"}},{"key":"bake.package","value":"oort"}],"steps":[{"name":"orca-config-step","status":"COMPLETED","startTime":1406151333471,"endTime":1406151333474},{"name":"CreateBakeStep","status":"COMPLETED","startTime":1406151333481,"endTime":1406151334433},{"name":"MonitorBakeStep","status":"COMPLETED","startTime":1406151334445,"endTime":1406151334535},{"name":"CompletedBakeStep","status":"COMPLETED","startTime":1406151334542,"endTime":1406151334640},{"name":"CreateDeployStep","status":"COMPLETED","startTime":1406151334648,"endTime":1406151337365},{"name":"MonitorDeployStep","status":"COMPLETED","startTime":1406151337376,"endTime":1406151375259},{"name":"WaitForUpInstancesStep","status":"COMPLETED","startTime":1406151375269,"endTime":1406151798710}],"startTime":1406151333466,"endTime":1406151798714},{"id":7,"name":"orca-job-9588c1e4-8146-4226-9ee4-364d0c2b1cc6","status":"FAILED","variables":[{"key":"deploy.application","value":"kato"},{"key":"deploy.server.groups","value":{"us-east-1":["kato-main-v030"]}},{"key":"deploy.stack","value":"main"},{"key":"kato.task.id","value":{"id":"s20xc"}},{"key":"deploy.availabilityZones","value":{"us-east-1":[]}},{"key":"bake.baseOs","value":"ubuntu"},{"key":"bake.baseLabel","value":"release"},{"key":"deploy.account.name","value":"prod"},{"key":"deploy.subnetType","value":"internal"},{"key":"bake.type","value":"bake"},{"key":"deploy.capacity","value":{"min":1,"max":1,"desired":1}},{"key":"deploy.iamRole","value":"SpinnakerInstanceProfile"},{"key":"deploy.instanceType","value":"m3.large"},{"key":"deploy.loadBalancers","value":["kato-main-frontend","kato-mcetest-external"]},{"key":"deploy.type","value":"deploy"},{"key":"bake.region","value":"us-east-1"},{"key":"deploy.credentials","value":"prod"},{"key":"bake.user","value":"danw"},{"key":"deploy.securityGroups","value":["nf-infrastructure-vpc","nf-datacenter-vpc"]},{"key":"bake.ami","value":"ami-7279b01a"},{"key":"bake.status","value":{"id":"s-2d4601mrt19w2930j2d9y85cm8","state":"COMPLETED","resourceId":"b-6qca3vfr7g9dfreyznwrn20v87"}},{"key":"bake.package","value":"kato"}],"steps":[{"name":"orca-config-step","status":"COMPLETED","startTime":1406167370281,"endTime":1406167370284},{"name":"CreateBakeStep","status":"COMPLETED","startTime":1406167370290,"endTime":1406167370815},{"name":"MonitorBakeStep","status":"COMPLETED","startTime":1406167370821,"endTime":1406167370937},{"name":"CompletedBakeStep","status":"COMPLETED","startTime":1406167370944,"endTime":1406167371066},{"name":"CreateDeployStep","status":"COMPLETED","startTime":1406167371073,"endTime":1406167371542},{"name":"MonitorDeployStep","status":"COMPLETED","startTime":1406167371550,"endTime":1406167410710},{"name":"WaitForUpInstancesStep","status":"FAILED","startTime":1406167410719,"endTime":1406168011551}],"startTime":1406167370276,"endTime":1406168011555},{"id":8,"name":"orca-job-a6471d90-53de-44da-8fd0-74971ff15ecf","status":"COMPLETED","variables":[{"key":"deploy.application","value":"kato"},{"key":"deploy.server.groups","value":{"us-east-1":["kato-main-v030"]}},{"key":"deploy.stack","value":"main"},{"key":"kato.task.id","value":{"id":"3n6z3d"}},{"key":"deploy.availabilityZones","value":{"us-east-1":[]}},{"key":"bake.baseOs","value":"ubuntu"},{"key":"bake.baseLabel","value":"release"},{"key":"deploy.account.name","value":"prod"},{"key":"deploy.subnetType","value":"internal"},{"key":"bake.type","value":"bake"},{"key":"deploy.capacity","value":{"min":1,"max":1,"desired":1}},{"key":"deploy.iamRole","value":"SpinnakerInstanceProfile"},{"key":"deploy.instanceType","value":"m3.large"},{"key":"deploy.loadBalancers","value":["kato-main-frontend","kato-mcetest-external"]},{"key":"deploy.type","value":"deploy"},{"key":"bake.region","value":"us-east-1"},{"key":"deploy.credentials","value":"prod"},{"key":"bake.user","value":"danw"},{"key":"deploy.securityGroups","value":["nf-infrastructure-vpc","nf-datacenter-vpc"]},{"key":"bake.ami","value":"ami-2a7db442"},{"key":"bake.status","value":{"id":"s-28ht1fby2695psrwmt5y7xzjxs","state":"COMPLETED","resourceId":"b-4ev9397xt68qfatajspb30e1nd"}},{"key":"bake.package","value":"kato"}],"steps":[{"name":"orca-config-step","status":"COMPLETED","startTime":1406168032075,"endTime":1406168032078},{"name":"CreateBakeStep","status":"COMPLETED","startTime":1406168032084,"endTime":1406168036650},{"name":"MonitorBakeStep","status":"COMPLETED","startTime":1406168036657,"endTime":1406168182172},{"name":"CompletedBakeStep","status":"COMPLETED","startTime":1406168182179,"endTime":1406168182277},{"name":"CreateDeployStep","status":"COMPLETED","startTime":1406168182284,"endTime":1406168182820},{"name":"MonitorDeployStep","status":"COMPLETED","startTime":1406168182830,"endTime":1406168219701},{"name":"WaitForUpInstancesStep","status":"COMPLETED","startTime":1406168219709,"endTime":1406168582087}],"startTime":1406168032070,"endTime":1406168582091},{"id":1,"name":"orca-job-e2fb1445-aa4c-48d8-9c75-cad05bbfe68c","status":"FAILED","variables":[{"key":"deploy.application","value":"front50"},{"key":"deploy.server.groups","value":{"us-west-1":["front50-v002"]}},{"key":"kato.task.id","value":{"id":"cnp2b0"}},{"key":"deploy.availabilityZones","value":{"us-west-1":[]}},{"key":"bake.baseOs","value":"ubuntu"},{"key":"bake.baseLabel","value":"release"},{"key":"deploy.account.name","value":"prod"},{"key":"deploy.subnetType","value":"internal"},{"key":"bake.type","value":"bake"},{"key":"deploy.capacity","value":{"min":3,"max":3,"desired":3}},{"key":"deploy.iamRole","value":"SpinnakerInstanceProfile"},{"key":"deploy.instanceType","value":"m3.large"},{"key":"deploy.loadBalancers","value":["front50-prod-frontend"]},{"key":"deploy.type","value":"deploy"},{"key":"bake.region","value":"us-west-1"},{"key":"deploy.credentials","value":"prod"},{"key":"bake.user","value":"danw"},{"key":"deploy.securityGroups","value":["nf-infrastructure-vpc","nf-datacenter-vpc"]},{"key":"bake.ami","value":"ami-8d8380c8"},{"key":"bake.status","value":{"id":"s-gq1vmqtg39febx08tgsefhptp","state":"COMPLETED","resourceId":"b-6vyr69058a85mtwafep7mp02nr"}},{"key":"bake.package","value":"front50"}],"steps":[{"name":"orca-config-step","status":"COMPLETED","startTime":1406145224849,"endTime":1406145224896},{"name":"CreateBakeStep","status":"COMPLETED","startTime":1406145224908,"endTime":1406145229845},{"name":"MonitorBakeStep","status":"COMPLETED","startTime":1406145229862,"endTime":1406145448532},{"name":"CompletedBakeStep","status":"COMPLETED","startTime":1406145448542,"endTime":1406145448846},{"name":"CreateDeployStep","status":"COMPLETED","startTime":1406145448855,"endTime":1406145449409},{"name":"MonitorDeployStep","status":"COMPLETED","startTime":1406145449419,"endTime":1406145459259},{"name":"WaitForUpInstancesStep","status":"FAILED","startTime":1406145459269,"endTime":1406146059642}],"startTime":1406145224827,"endTime":1406146059646},{"id":2,"name":"orca-job-fac0f664-2530-42c0-840e-9bfa885ab72b","status":"FAILED","variables":[{"key":"deploy.application","value":"front50"},{"key":"deploy.server.groups","value":{"us-west-1":["front50-v003"]}},{"key":"kato.task.id","value":{"id":"eh0d0j"}},{"key":"deploy.availabilityZones","value":{"us-west-1":[]}},{"key":"bake.baseOs","value":"ubuntu"},{"key":"bake.baseLabel","value":"release"},{"key":"deploy.account.name","value":"prod"},{"key":"deploy.subnetType","value":"internal"},{"key":"bake.type","value":"bake"},{"key":"deploy.capacity","value":{"min":3,"max":3,"desired":3}},{"key":"deploy.iamRole","value":"SpinnakerInstanceProfile"},{"key":"deploy.instanceType","value":"m3.large"},{"key":"deploy.loadBalancers","value":["front50-prod-frontend"]},{"key":"deploy.type","value":"deploy"},{"key":"bake.region","value":"us-west-1"},{"key":"deploy.credentials","value":"prod"},{"key":"bake.user","value":"danw"},{"key":"deploy.securityGroups","value":["nf-infrastructure-vpc","nf-datacenter-vpc"]},{"key":"bake.ami","value":"ami-938281d6"},{"key":"bake.status","value":{"id":"s-5y7g79y6n484r9mb0vt1xkbpzc","state":"COMPLETED","resourceId":"b-6bkzbs2nv48mcvzz0ya7ry2ds3"}},{"key":"bake.package","value":"front50"}],"steps":[{"name":"orca-config-step","status":"COMPLETED","startTime":1406147435187,"endTime":1406147435193},{"name":"CreateBakeStep","status":"COMPLETED","startTime":1406147435202,"endTime":1406147439252},{"name":"MonitorBakeStep","status":"COMPLETED","startTime":1406147439262,"endTime":1406147676332},{"name":"CompletedBakeStep","status":"COMPLETED","startTime":1406147676340,"endTime":1406147676355},{"name":"CreateDeployStep","status":"COMPLETED","startTime":1406147676365,"endTime":1406147676909},{"name":"MonitorDeployStep","status":"COMPLETED","startTime":1406147676918,"endTime":1406147686728},{"name":"WaitForUpInstancesStep","status":"FAILED","startTime":1406147686738,"endTime":1406148286903}],"startTime":1406147435180,"endTime":1406148286907}]
  );
