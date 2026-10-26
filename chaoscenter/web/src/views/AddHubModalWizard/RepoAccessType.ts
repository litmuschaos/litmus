import { RepoType } from '@api/entities';

interface RepoAccessType {
  _cardName: RepoType;
  text: string;
  key: boolean;
  view?: React.FC;
}

export default function getRepoAccessType(): RepoAccessType[] {
  return [
    {
      _cardName: RepoType.PUBLIC,
      text: 'Public',
      key: false
    },
    {
      _cardName: RepoType.PRIVATE,
      text: 'Private',
      key: true
    }
  ];
}
