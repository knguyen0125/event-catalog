import React from 'react';
import Avatar from '~/components/Avatar';
import { Link } from '@remix-run/react';
import type { Owner } from '~/database/models';
import type { ModelObject } from 'objection';

const OwnerCard: React.FC<{ owner: ModelObject<Owner> }> = ({ owner }) => {
  return (
    <Link to={`./${owner.email}`} key={owner.email}>
      <div className="flex">
        <Avatar src={owner.image} alt={owner.name} />
        <div className={'ml-2 flex flex-col'}>
          <span className={'font-bold'}>
            {owner.name} - {owner.role}
          </span>
          <span>{owner.email}</span>
        </div>
      </div>
    </Link>
  );
};

export default OwnerCard;
