import React from 'react';
import { ModelObject } from 'objection';
import slugify from 'slugify';
import { Link } from '@remix-run/react';
import { CubeIcon, RectangleStackIcon } from '@heroicons/react/24/outline';
import CardV2 from '~/components/CardV2';
import { Doc } from '~/database/models.server';

const getDocPath = (doc: ModelObject<Doc>) => {
  const docPath = `${doc.id}-${slugify(doc.file_name)}`;
  if (doc.domain_name) {
    // if (doc.service?.name) {
    //   return `/domains/${doc.domain.name}/services/${doc.service.name}/docs/${docPath}`;
    // }
    return `/domains/${doc.domain_name}/docs/${docPath}`;
  }

  return `/services/${doc.service_name}/docs/${docPath}`;
};

type DocListProps = {
  docs: ModelObject<Doc>[];
};

const DocList: React.FC<DocListProps> = ({ docs }) => {
  return (
    <ul className="grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {docs.map((doc) => (
        <li key={doc.id}>
          <Link to={getDocPath(doc)} key={doc.id}>
            <CardV2
              title={doc.title || doc.file_name}
              description={doc.summary}
              additionalDetails={[
                doc.domain_name
                  ? {
                      icon: RectangleStackIcon,
                      iconClassName: 'text-red-500',
                      text: doc.domain_name,
                    }
                  : null,
                doc.service_name
                  ? {
                      icon: CubeIcon,
                      iconClassName: 'text-blue-500',
                      text: doc.service_name,
                    }
                  : null,
              ]}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default DocList;
