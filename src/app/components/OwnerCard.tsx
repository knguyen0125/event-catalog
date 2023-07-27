import React from 'react';
import Avatar from '~/components/Avatar';
import { Link } from '@remix-run/react';
import type { Owner } from '~/database/models';
import type { ModelObject } from 'objection';
import Card from '~/components/Card';

const OwnerCard: React.FC<{ owner: ModelObject<Owner> }> = ({ owner }) => {
  return (
    <Link to={`./${owner.email}`} key={owner.email}>
      <Card>
        <div className="flex gap-x-1">
          <Avatar src={owner.image} alt={owner.name} />
          <div className={'ml-2 flex flex-col'}>
            <span className={'font-bold'}>
              {owner.name}
              {owner.role ? ` - ${owner.role}` : ''}
            </span>
            <span>{owner.email}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default OwnerCard;
