import React from 'react';
import { Plus, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { StatusSelect } from '../ui/StatusSelect';
import { ENTRY_STATUS } from '../../constants/status';

export function EntryForm({
  darkMode,
  formData,
  editingId,
  isSaving,
  onChange,
  onSubmit,
  onCancelEdit,
}) {
  return (
    <Card darkMode={darkMode}>
      <h2 className="text-2xl font-bold mb-6">
        {editingId ? '✏️ Edit Study Entry' : '📝 Add New Study Entry'}
      </h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          darkMode={darkMode}
          label="Week *"
          name="week"
          value={formData.week}
          onChange={onChange}
          placeholder="e.g., Week 1"
          required
          maxLength={80}
        />
        <Input
          darkMode={darkMode}
          label="Topic *"
          name="topic"
          value={formData.topic}
          onChange={onChange}
          placeholder="e.g., Network Security"
          required
          maxLength={200}
        />
        <Input
          darkMode={darkMode}
          label="Study Goal *"
          name="goal"
          value={formData.goal}
          onChange={onChange}
          placeholder="e.g., Learn about firewalls"
          required
          maxLength={500}
        />
        <div>
          <label
            htmlFor="entry-status"
            className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Status
          </label>
          <StatusSelect
            darkMode={darkMode}
            id="entry-status"
            value={formData.status || ENTRY_STATUS.NOT_STARTED}
            onChange={onChange}
          />
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor="entry-notes"
            className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Notes (optional)
          </label>
          <textarea
            id="entry-notes"
            name="notes"
            value={formData.notes}
            onChange={onChange}
            placeholder="Additional notes…"
            rows={3}
            maxLength={2000}
            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            variant="primary"
            loading={isSaving}
            disabled={isSaving}
            icon={Plus}
            className="flex-1 w-full sm:w-auto"
          >
            {editingId ? 'Update Entry' : 'Add Entry'}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={onCancelEdit} icon={X}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
