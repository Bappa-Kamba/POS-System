import React, { useState } from 'react';
import { Plus, Layers } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { SubdivisionTable } from '../../components/subdivisions/SubdivisionTable';
import { SubdivisionForm } from '../../components/subdivisions/SubdivisionForm';
import {
  useSubdivisions,
  useCreateSubdivision,
  useUpdateSubdivision,
  useToggleSubdivisionStatus,
} from '../../hooks/useSubdivisions';
import type { Subdivision } from '../../types/subdivision';

export const SubdivisionsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubdivision, setSelectedSubdivision] = useState<Subdivision | null>(
    null
  );

  const { data: subdivisionsResponse, isLoading } = useSubdivisions();
  const createSubdivision = useCreateSubdivision();
  const updateSubdivision = useUpdateSubdivision();
  const toggleStatus = useToggleSubdivisionStatus();

  const subdivisions = subdivisionsResponse?.success ? subdivisionsResponse.data : [];

  const handleCreate = async (formData: any) => {
    try {
      await createSubdivision.mutateAsync(formData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create subdivision:', error);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!selectedSubdivision) return;

    try {
      await updateSubdivision.mutateAsync({
        id: selectedSubdivision.id,
        data: formData,
      });
      setIsEditModalOpen(false);
      setSelectedSubdivision(null);
    } catch (error) {
      console.error('Failed to update subdivision:', error);
    }
  };

  const handleEdit = (subdivision: Subdivision) => {
    setSelectedSubdivision(subdivision);
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async (subdivision: Subdivision) => {
    if (
      !confirm(
        `Are you sure you want to ${
          subdivision.status === 'ACTIVE' ? 'deactivate' : 'activate'
        } ${subdivision.displayName}?`
      )
    ) {
      return;
    }

    try {
      await toggleStatus.mutateAsync(subdivision.id);
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Subdivision Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage product subdivisions and their settings
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Subdivision
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Subdivisions
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {subdivisions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subdivisions Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <SubdivisionTable
          subdivisions={subdivisions}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Subdivision"
        size="lg"
      >
        <SubdivisionForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createSubdivision.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSubdivision(null);
        }}
        title="Edit Subdivision"
        size="lg"
      >
        {selectedSubdivision && (
          <SubdivisionForm
            subdivision={selectedSubdivision}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedSubdivision(null);
            }}
            isLoading={updateSubdivision.isPending}
          />
        )}
      </Modal>
    </div>
  );
};
