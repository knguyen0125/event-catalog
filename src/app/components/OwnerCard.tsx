import React from 'react';
import Avatar from '~/components/Avatar';
import type { Owner } from '~/database/models';
import type { ModelObject } from 'objection';

const OwnerCard: React.FC<{ owner: ModelObject<Owner> }> = ({ owner }) => {
  return (
    <div
      className={
        'overflow-hidden rounded-lg bg-white shadow hover:bg-gray-50 hover:shadow-md'
      }
    >
      <div className="flex gap-x-1 p-4">
        <Avatar src={owner.image} alt={owner.name} />
        <div className={'ml-2 flex flex-col'}>
          <span className={'text-lg font-bold'}>
            {owner.name}
            {owner.role ? ` - ${owner.role}` : ''}
          </span>
          <span>{owner.email}</span>
        </div>
      </div>
    </div>
  );
};

export default OwnerCard;
