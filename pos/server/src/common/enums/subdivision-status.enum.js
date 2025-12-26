"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubdivisionStatus = void 0;
exports.getStatusLabel = getStatusLabel;
exports.getStatusColor = getStatusColor;
var SubdivisionStatus;
(function (SubdivisionStatus) {
    SubdivisionStatus["ACTIVE"] = "ACTIVE";
    SubdivisionStatus["INACTIVE"] = "INACTIVE";
    SubdivisionStatus["ARCHIVED"] = "ARCHIVED";
})(SubdivisionStatus || (exports.SubdivisionStatus = SubdivisionStatus = {}));
function getStatusLabel(status) {
    const labels = {
        [SubdivisionStatus.ACTIVE]: 'Active',
        [SubdivisionStatus.INACTIVE]: 'Inactive',
        [SubdivisionStatus.ARCHIVED]: 'Archived',
    };
    return labels[status];
}
function getStatusColor(status) {
    const colors = {
        [SubdivisionStatus.ACTIVE]: 'green',
        [SubdivisionStatus.INACTIVE]: 'yellow',
        [SubdivisionStatus.ARCHIVED]: 'gray',
    };
    return colors[status];
}
//# sourceMappingURL=subdivision-status.enum.js.map