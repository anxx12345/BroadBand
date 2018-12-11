var test = '-"  -----------------------------------------------------------------------------\n' +
    '  F/S/P                   : 0/1/0\n' +
    '  ONT-ID                  : 14\n' +
    '  Control flag            : active\n' +
    '  Run state               : online\n' +
    '  Config state            : normal\n' +
    '  Match state             : match\n' +
    '  DBA type                : SR\n' +
    '  ONT distance(m)         : 1090\n' +
    '  ONT battery state       : holding state\n' +
    '  Memory occupation       : -\n' +
    '  CPU occupation          : -\n' +
    '  Temperature             : -\n' +
    '  Authentic type          : loid-auth\n' +
    '  Discovery mode          : always-on mode\n' +
    '  Discovery state         : on\n' +
    '  SN                      : 464854542161E190 (FHTT-2161E190)\n' +
    '  Loid                    : 5570111433\n' +
    '  Management mode         : OMCI\n' +
    '  Software work mode      : normal\n' +
    '  Isolation state         : normal\n' +
    '  ONT IP 0 address/mask   : -\n' +
    '  Description             : ONT_NO_DESCRIPTION\n' +
    ' Last down cause         : dying-gasp\n' +
    '  Last up time            : 2018-08-05 16:51:08+08:00\n' +
    '  Last down time          : 2018-08-05 16:28:34+08:00\n' +
    '  Last dying gasp time    : 2018-08-05 16:28:34+08:00\n' +
    '  ONT online duration     : 3 day(s), 15 hour(s), 23 minute(s), 40 second(s) \n' +
    '  Type C support          : Not support\n' +
    '  Interoperability-mode   : ITU-T\n' +
    '  -----------------------------------------------------------------------------\n' +
    '  "';
console.log(test.split('\n')[2].split(':')[1].trim());

let zte = 'gpon-onu_1/3/4:24'
console.log(zte.split(':')[1])

let x = {
    xxx:2,
    fff:3
}
console.log(x.toString())