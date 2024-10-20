import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface LeadFiltersProps {
    dateFilter: string;
    statusFilter: string;
    searchTerm: string;
    onDateFilterChange: (value: string) => void;
    onStatusFilterChange: (value: string) => void;
    onSearchTermChange: (value: string) => void;
    onImportCSV: () => void;
    onExportCSV: () => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
    dateFilter,
    statusFilter,
    searchTerm,
    onDateFilterChange,
    onStatusFilterChange,
    onSearchTermChange,
    onImportCSV,
    onExportCSV
}) => {
    return (
        <div className="mb-4 flex space-x-4">
            <Input
                type="date"
                value={dateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="no_coverage">No Coverage</SelectItem>
                    <SelectItem value="rejected_overturned">Rejected Overturned</SelectItem>
                </SelectContent>
            </Select>
            <Input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                placeholder="Search..."
            />
            <Button onClick={onImportCSV}>Import CSV</Button>
            <Button onClick={onExportCSV}>Export CSV</Button>
        </div>
    );
};