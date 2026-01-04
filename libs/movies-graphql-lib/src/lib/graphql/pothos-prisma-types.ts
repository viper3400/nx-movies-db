/* eslint-disable */
import type { Prisma, homewebbridge_inventory, homewebbridge_inventorydata, homewebbridge_usermoviesettings, homewebbridge_userseen, videodb_actors, videodb_genres, videodb_mediatypes, videodb_users, videodb_videodata, videodb_videogenre } from "../../../../movies-prisma-lib/src/generated/client.js";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
export default interface PrismaTypes {
    homewebbridge_inventory: {
        Name: "homewebbridge_inventory";
        Shape: homewebbridge_inventory;
        Include: never;
        Select: Prisma.homewebbridge_inventorySelect;
        OrderBy: Prisma.homewebbridge_inventoryOrderByWithRelationInput;
        WhereUnique: Prisma.homewebbridge_inventoryWhereUniqueInput;
        Where: Prisma.homewebbridge_inventoryWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    homewebbridge_inventorydata: {
        Name: "homewebbridge_inventorydata";
        Shape: homewebbridge_inventorydata;
        Include: never;
        Select: Prisma.homewebbridge_inventorydataSelect;
        OrderBy: Prisma.homewebbridge_inventorydataOrderByWithRelationInput;
        WhereUnique: Prisma.homewebbridge_inventorydataWhereUniqueInput;
        Where: Prisma.homewebbridge_inventorydataWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    homewebbridge_usermoviesettings: {
        Name: "homewebbridge_usermoviesettings";
        Shape: homewebbridge_usermoviesettings;
        Include: Prisma.homewebbridge_usermoviesettingsInclude;
        Select: Prisma.homewebbridge_usermoviesettingsSelect;
        OrderBy: Prisma.homewebbridge_usermoviesettingsOrderByWithRelationInput;
        WhereUnique: Prisma.homewebbridge_usermoviesettingsWhereUniqueInput;
        Where: Prisma.homewebbridge_usermoviesettingsWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: videodb_videodata;
                Name: "videodb_videodata";
                Nullable: false;
            };
        };
    };
    homewebbridge_userseen: {
        Name: "homewebbridge_userseen";
        Shape: homewebbridge_userseen;
        Include: Prisma.homewebbridge_userseenInclude;
        Select: Prisma.homewebbridge_userseenSelect;
        OrderBy: Prisma.homewebbridge_userseenOrderByWithRelationInput;
        WhereUnique: Prisma.homewebbridge_userseenWhereUniqueInput;
        Where: Prisma.homewebbridge_userseenWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: videodb_videodata;
                Name: "videodb_videodata";
                Nullable: false;
            };
        };
    };
    videodb_actors: {
        Name: "videodb_actors";
        Shape: videodb_actors;
        Include: never;
        Select: Prisma.videodb_actorsSelect;
        OrderBy: Prisma.videodb_actorsOrderByWithRelationInput;
        WhereUnique: Prisma.videodb_actorsWhereUniqueInput;
        Where: Prisma.videodb_actorsWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    videodb_genres: {
        Name: "videodb_genres";
        Shape: videodb_genres;
        Include: Prisma.videodb_genresInclude;
        Select: Prisma.videodb_genresSelect;
        OrderBy: Prisma.videodb_genresOrderByWithRelationInput;
        WhereUnique: Prisma.videodb_genresWhereUniqueInput;
        Where: Prisma.videodb_genresWhereInput;
        Create: {};
        Update: {};
        RelationName: "videodb_videogenre";
        ListRelations: "videodb_videogenre";
        Relations: {
            videodb_videogenre: {
                Shape: videodb_videogenre[];
                Name: "videodb_videogenre";
                Nullable: false;
            };
        };
    };
    videodb_mediatypes: {
        Name: "videodb_mediatypes";
        Shape: videodb_mediatypes;
        Include: Prisma.videodb_mediatypesInclude;
        Select: Prisma.videodb_mediatypesSelect;
        OrderBy: Prisma.videodb_mediatypesOrderByWithRelationInput;
        WhereUnique: Prisma.videodb_mediatypesWhereUniqueInput;
        Where: Prisma.videodb_mediatypesWhereInput;
        Create: {};
        Update: {};
        RelationName: "videodb_videodata";
        ListRelations: "videodb_videodata";
        Relations: {
            videodb_videodata: {
                Shape: videodb_videodata[];
                Name: "videodb_videodata";
                Nullable: false;
            };
        };
    };
    videodb_users: {
        Name: "videodb_users";
        Shape: videodb_users;
        Include: never;
        Select: Prisma.videodb_usersSelect;
        OrderBy: Prisma.videodb_usersOrderByWithRelationInput;
        WhereUnique: Prisma.videodb_usersWhereUniqueInput;
        Where: Prisma.videodb_usersWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    videodb_videodata: {
        Name: "videodb_videodata";
        Shape: videodb_videodata;
        Include: Prisma.videodb_videodataInclude;
        Select: Prisma.videodb_videodataSelect;
        OrderBy: Prisma.videodb_videodataOrderByWithRelationInput;
        WhereUnique: Prisma.videodb_videodataWhereUniqueInput;
        Where: Prisma.videodb_videodataWhereInput;
        Create: {};
        Update: {};
        RelationName: "videodb_videogenre" | "videodb_mediatypes" | "userSeen" | "userMovieSettings";
        ListRelations: "videodb_videogenre" | "userSeen" | "userMovieSettings";
        Relations: {
            videodb_videogenre: {
                Shape: videodb_videogenre[];
                Name: "videodb_videogenre";
                Nullable: false;
            };
            videodb_mediatypes: {
                Shape: videodb_mediatypes;
                Name: "videodb_mediatypes";
                Nullable: false;
            };
            userSeen: {
                Shape: homewebbridge_userseen[];
                Name: "homewebbridge_userseen";
                Nullable: false;
            };
            userMovieSettings: {
                Shape: homewebbridge_usermoviesettings[];
                Name: "homewebbridge_usermoviesettings";
                Nullable: false;
            };
        };
    };
    videodb_videogenre: {
        Name: "videodb_videogenre";
        Shape: videodb_videogenre;
        Include: Prisma.videodb_videogenreInclude;
        Select: Prisma.videodb_videogenreSelect;
        OrderBy: Prisma.videodb_videogenreOrderByWithRelationInput;
        WhereUnique: Prisma.videodb_videogenreWhereUniqueInput;
        Where: Prisma.videodb_videogenreWhereInput;
        Create: {};
        Update: {};
        RelationName: "video" | "genre";
        ListRelations: never;
        Relations: {
            video: {
                Shape: videodb_videodata;
                Name: "videodb_videodata";
                Nullable: false;
            };
            genre: {
                Shape: videodb_genres;
                Name: "videodb_genres";
                Nullable: false;
            };
        };
    };
}
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"homewebbridge_inventory\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"starttime\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"endtime\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"state\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"homewebbridge_inventorydata\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"movieid\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"state\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"inventoryid\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"rackid\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"homewebbridge_usermoviesettings\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"vdb_movieid\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"asp_username\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"is_favorite\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"watchagain\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"videodb_videodata\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"homewebbridge_usermoviesettingsTovideodb_videodata\",\"relationFromFields\":[\"vdb_movieid\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"homewebbridge_userseen\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"vdb_videoid\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"viewdate\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"asp_viewgroup\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"asp_username\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"videodb_videodata\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"homewebbridge_userseenTovideodb_videodata\",\"relationFromFields\":[\"vdb_videoid\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"videodb_actors\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"actorid\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"imgurl\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"checked\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"videodb_genres\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"videodb_videogenre\",\"kind\":\"object\",\"name\":\"videodb_videogenre\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"videodb_genresTovideodb_videogenre\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"videodb_mediatypes\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"videodb_videodata\",\"kind\":\"object\",\"name\":\"videodb_videodata\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"videodb_mediatypesTovideodb_videodata\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"videodb_users\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"passwd\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"cookiecode\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"permissions\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"timestamp\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"videodb_videodata\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"md5\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"subtitle\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"language\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"diskid\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"comment\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"disklabel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"imdbID\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"year\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"imgurl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"director\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"actors\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"runtime\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"country\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"plot\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"rating\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"filename\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"filesize\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"filedate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"audio_codec\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"video_codec\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"video_width\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"video_height\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"istv\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastupdate\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"mediatype\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"custom1\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"custom2\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"custom3\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"custom4\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"created\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"owner_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"videodb_videogenre\",\"kind\":\"object\",\"name\":\"videodb_videogenre\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"videodb_videodataTovideodb_videogenre\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"videodb_mediatypes\",\"kind\":\"object\",\"name\":\"videodb_mediatypes\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"videodb_mediatypesTovideodb_videodata\",\"relationFromFields\":[\"mediatype\"],\"isUpdatedAt\":false},{\"type\":\"homewebbridge_userseen\",\"kind\":\"object\",\"name\":\"userSeen\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"homewebbridge_userseenTovideodb_videodata\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"homewebbridge_usermoviesettings\",\"kind\":\"object\",\"name\":\"userMovieSettings\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"homewebbridge_usermoviesettingsTovideodb_videodata\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"videodb_videogenre\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"video_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"genre_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"videodb_videodata\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"videodb_videodataTovideodb_videogenre\",\"relationFromFields\":[\"video_id\"],\"isUpdatedAt\":false},{\"type\":\"videodb_genres\",\"kind\":\"object\",\"name\":\"genre\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"videodb_genresTovideodb_videogenre\",\"relationFromFields\":[\"genre_id\"],\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"video_id\",\"genre_id\"]},\"uniqueIndexes\":[]}}}}"); }