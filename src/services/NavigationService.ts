import { Location } from 'vue-router';
import { Album } from '@/dto/Album';

export class NavigationService {

    getBrowse(album: Album): Location {
        const ids: string[] = [];
        if (album.parents) {
            album.parents
                .map(v => v.id)
                .forEach(id => ids.push(id));
        }
        const path = ids.join('/');
        return { path: `/browse/${path}` };
    }

}
