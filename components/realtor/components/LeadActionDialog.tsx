import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Lead } from '../types'

interface LeadActionDialogProps {
  lead: Lead
  onStatusUpdate: (assignmentId: string, newStatus: string) => Promise<void>
  onAddComment: (assignmentId: string, comment: string) => Promise<void>
}

export const LeadActionDialog: React.FC<LeadActionDialogProps> = ({ lead, onStatusUpdate, onAddComment }) => {
  const [newStatus, setNewStatus] = useState<string>('')
  const [comment, setComment] = useState<string>('')

  const handleAction = () => {
    if (lead.canChangeStatus && newStatus) {
      onStatusUpdate(lead.id, newStatus)
    }
    if (comment) {
      onAddComment(lead.id, comment)
    }
    setNewStatus('')
    setComment('')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {lead.canChangeStatus ? 'Update Status' : 'Add Comment'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{lead.canChangeStatus ? 'Update Lead Status' : 'Add Comment'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {lead.canChangeStatus && (
            <Select onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Listing Agreement Signed">Listing Agreement Signed</SelectItem>
                <SelectItem value="Not interested in selling">Not interested in selling</SelectItem>
                <SelectItem value="Resulted in not listing">Resulted in not listing</SelectItem>
                <SelectItem value="Listed by Homeowner">Listed by Homeowner</SelectItem>
                <SelectItem value="Follow up needed">Follow up needed</SelectItem>
                <SelectItem value="Appointment scheduled">Appointment scheduled</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Textarea
            placeholder="Add a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button onClick={handleAction}>
            {lead.canChangeStatus ? 'Update Status and Comment' : 'Add Comment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}