 
# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **mongoose,typegoose,#881:** Allow string objectId filters ([11098c4](https://github.com/TriPSs/nestjs-query/commit/11098c441de41462fe6c45742bc317f52ea09711)), closes [#881](https://github.com/TriPSs/nestjs-query/issues/881)
* **mongoose,typegoose:** fix type errors from bad renovate bot merge ([46d9a6f](https://github.com/TriPSs/nestjs-query/commit/46d9a6f49c011c5bc40d00b92d2fa17059f2702c))
* **query-typegoose:** ignore undefined id field in creation dto ([#1165](https://github.com/TriPSs/nestjs-query/issues/1165)) ([db5bf44](https://github.com/TriPSs/nestjs-query/commit/db5bf447bdf0095b01791b694785ecd3fb723c0f))
* **typegoose:** allow undefined id field when updating or creating ([c2031aa](https://github.com/TriPSs/nestjs-query/commit/c2031aaf8c65fe7f2440f5b434329662c02296e4))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **mongodb:** Add support for all filter operators ([9420036](https://github.com/TriPSs/nestjs-query/commit/9420036d8d24e825c08b60bd9773404e26968ea5))
* **mongodb:** Add support for list of references ([bc926a4](https://github.com/TriPSs/nestjs-query/commit/bc926a4f089fd790b8bc37ee126bfcc2f70fc145))
* **mongodb:** Allow to customize mongoose document options ([46db24a](https://github.com/TriPSs/nestjs-query/commit/46db24ac2b424b9379d380792328ee670fb281e3))
* **mongodb:** Allow to override filter operators ([24e7c0a](https://github.com/TriPSs/nestjs-query/commit/24e7c0a6146ca37598b73577bd772e0e79dea823))
* **mongodb:** Include virtuals on document responses ([bc407a0](https://github.com/TriPSs/nestjs-query/commit/bc407a0f7100a741d8a4084227e3767fcf36dd4a))
* **mongodb:** Use new filter on typegoose query service ([de34e92](https://github.com/TriPSs/nestjs-query/commit/de34e9240055b0f1cfbb360b66c37f216f115ddb))
* **mongodb:** Use typegoose for MongoDB support ([702dc83](https://github.com/TriPSs/nestjs-query/commit/702dc839638afd6b781dbb0f75f725d7286eb580))
* **mongoose:** Switch to native mongoose support ([5cdfa39](https://github.com/TriPSs/nestjs-query/commit/5cdfa39b7d91cf0f8438ef3387a89aac850f4452))
* **query-typegoose:** Adds the ability to use discriminators ([#1321](https://github.com/TriPSs/nestjs-query/issues/1321)) ([2a7da59](https://github.com/TriPSs/nestjs-query/commit/2a7da59c3c857acedbd786d6df5772645c00f543)), closes [#1320](https://github.com/TriPSs/nestjs-query/issues/1320)
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))
* **typegoose:** Implement `setRelations` to set many references ([4ec5fe0](https://github.com/TriPSs/nestjs-query/commit/4ec5fe07689eacb0456f531d69368b0451ce69a1))
* **typegoose:** Update to support new aggregate with groupBy ([90992e1](https://github.com/TriPSs/nestjs-query/commit/90992e1a1dcc4e4e888e5946ab639535932f8f52))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **mongoose,typegoose,#881:** Allow string objectId filters ([11098c4](https://github.com/TriPSs/nestjs-query/commit/11098c441de41462fe6c45742bc317f52ea09711)), closes [#881](https://github.com/TriPSs/nestjs-query/issues/881)
* **mongoose,typegoose:** fix type errors from bad renovate bot merge ([46d9a6f](https://github.com/TriPSs/nestjs-query/commit/46d9a6f49c011c5bc40d00b92d2fa17059f2702c))
* **query-typegoose:** ignore undefined id field in creation dto ([#1165](https://github.com/TriPSs/nestjs-query/issues/1165)) ([db5bf44](https://github.com/TriPSs/nestjs-query/commit/db5bf447bdf0095b01791b694785ecd3fb723c0f))
* **typegoose:** allow undefined id field when updating or creating ([c2031aa](https://github.com/TriPSs/nestjs-query/commit/c2031aaf8c65fe7f2440f5b434329662c02296e4))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **mongodb:** Add support for all filter operators ([9420036](https://github.com/TriPSs/nestjs-query/commit/9420036d8d24e825c08b60bd9773404e26968ea5))
* **mongodb:** Add support for list of references ([bc926a4](https://github.com/TriPSs/nestjs-query/commit/bc926a4f089fd790b8bc37ee126bfcc2f70fc145))
* **mongodb:** Allow to customize mongoose document options ([46db24a](https://github.com/TriPSs/nestjs-query/commit/46db24ac2b424b9379d380792328ee670fb281e3))
* **mongodb:** Allow to override filter operators ([24e7c0a](https://github.com/TriPSs/nestjs-query/commit/24e7c0a6146ca37598b73577bd772e0e79dea823))
* **mongodb:** Include virtuals on document responses ([bc407a0](https://github.com/TriPSs/nestjs-query/commit/bc407a0f7100a741d8a4084227e3767fcf36dd4a))
* **mongodb:** Use new filter on typegoose query service ([de34e92](https://github.com/TriPSs/nestjs-query/commit/de34e9240055b0f1cfbb360b66c37f216f115ddb))
* **mongodb:** Use typegoose for MongoDB support ([702dc83](https://github.com/TriPSs/nestjs-query/commit/702dc839638afd6b781dbb0f75f725d7286eb580))
* **mongoose:** Switch to native mongoose support ([5cdfa39](https://github.com/TriPSs/nestjs-query/commit/5cdfa39b7d91cf0f8438ef3387a89aac850f4452))
* **query-typegoose:** Adds the ability to use discriminators ([#1321](https://github.com/TriPSs/nestjs-query/issues/1321)) ([2a7da59](https://github.com/TriPSs/nestjs-query/commit/2a7da59c3c857acedbd786d6df5772645c00f543)), closes [#1320](https://github.com/TriPSs/nestjs-query/issues/1320)
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))
* **typegoose:** Implement `setRelations` to set many references ([4ec5fe0](https://github.com/TriPSs/nestjs-query/commit/4ec5fe07689eacb0456f531d69368b0451ce69a1))
* **typegoose:** Update to support new aggregate with groupBy ([90992e1](https://github.com/TriPSs/nestjs-query/commit/90992e1a1dcc4e4e888e5946ab639535932f8f52))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **mongoose,typegoose,#881:** Allow string objectId filters ([11098c4](https://github.com/TriPSs/nestjs-query/commit/11098c441de41462fe6c45742bc317f52ea09711)), closes [#881](https://github.com/TriPSs/nestjs-query/issues/881)
* **mongoose,typegoose:** fix type errors from bad renovate bot merge ([46d9a6f](https://github.com/TriPSs/nestjs-query/commit/46d9a6f49c011c5bc40d00b92d2fa17059f2702c))
* **query-typegoose:** ignore undefined id field in creation dto ([#1165](https://github.com/TriPSs/nestjs-query/issues/1165)) ([db5bf44](https://github.com/TriPSs/nestjs-query/commit/db5bf447bdf0095b01791b694785ecd3fb723c0f))
* **typegoose:** allow undefined id field when updating or creating ([c2031aa](https://github.com/TriPSs/nestjs-query/commit/c2031aaf8c65fe7f2440f5b434329662c02296e4))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **mongodb:** Add support for all filter operators ([9420036](https://github.com/TriPSs/nestjs-query/commit/9420036d8d24e825c08b60bd9773404e26968ea5))
* **mongodb:** Add support for list of references ([bc926a4](https://github.com/TriPSs/nestjs-query/commit/bc926a4f089fd790b8bc37ee126bfcc2f70fc145))
* **mongodb:** Allow to customize mongoose document options ([46db24a](https://github.com/TriPSs/nestjs-query/commit/46db24ac2b424b9379d380792328ee670fb281e3))
* **mongodb:** Allow to override filter operators ([24e7c0a](https://github.com/TriPSs/nestjs-query/commit/24e7c0a6146ca37598b73577bd772e0e79dea823))
* **mongodb:** Include virtuals on document responses ([bc407a0](https://github.com/TriPSs/nestjs-query/commit/bc407a0f7100a741d8a4084227e3767fcf36dd4a))
* **mongodb:** Use new filter on typegoose query service ([de34e92](https://github.com/TriPSs/nestjs-query/commit/de34e9240055b0f1cfbb360b66c37f216f115ddb))
* **mongodb:** Use typegoose for MongoDB support ([702dc83](https://github.com/TriPSs/nestjs-query/commit/702dc839638afd6b781dbb0f75f725d7286eb580))
* **mongoose:** Switch to native mongoose support ([5cdfa39](https://github.com/TriPSs/nestjs-query/commit/5cdfa39b7d91cf0f8438ef3387a89aac850f4452))
* **query-typegoose:** Adds the ability to use discriminators ([#1321](https://github.com/TriPSs/nestjs-query/issues/1321)) ([2a7da59](https://github.com/TriPSs/nestjs-query/commit/2a7da59c3c857acedbd786d6df5772645c00f543)), closes [#1320](https://github.com/TriPSs/nestjs-query/issues/1320)
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))
* **typegoose:** Implement `setRelations` to set many references ([4ec5fe0](https://github.com/TriPSs/nestjs-query/commit/4ec5fe07689eacb0456f531d69368b0451ce69a1))
* **typegoose:** Update to support new aggregate with groupBy ([90992e1](https://github.com/TriPSs/nestjs-query/commit/90992e1a1dcc4e4e888e5946ab639535932f8f52))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **mongoose,typegoose,#881:** Allow string objectId filters ([11098c4](https://github.com/TriPSs/nestjs-query/commit/11098c441de41462fe6c45742bc317f52ea09711)), closes [#881](https://github.com/TriPSs/nestjs-query/issues/881)
* **mongoose,typegoose:** fix type errors from bad renovate bot merge ([46d9a6f](https://github.com/TriPSs/nestjs-query/commit/46d9a6f49c011c5bc40d00b92d2fa17059f2702c))
* **query-typegoose:** ignore undefined id field in creation dto ([#1165](https://github.com/TriPSs/nestjs-query/issues/1165)) ([db5bf44](https://github.com/TriPSs/nestjs-query/commit/db5bf447bdf0095b01791b694785ecd3fb723c0f))
* **typegoose:** allow undefined id field when updating or creating ([c2031aa](https://github.com/TriPSs/nestjs-query/commit/c2031aaf8c65fe7f2440f5b434329662c02296e4))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **mongodb:** Add support for all filter operators ([9420036](https://github.com/TriPSs/nestjs-query/commit/9420036d8d24e825c08b60bd9773404e26968ea5))
* **mongodb:** Add support for list of references ([bc926a4](https://github.com/TriPSs/nestjs-query/commit/bc926a4f089fd790b8bc37ee126bfcc2f70fc145))
* **mongodb:** Allow to customize mongoose document options ([46db24a](https://github.com/TriPSs/nestjs-query/commit/46db24ac2b424b9379d380792328ee670fb281e3))
* **mongodb:** Allow to override filter operators ([24e7c0a](https://github.com/TriPSs/nestjs-query/commit/24e7c0a6146ca37598b73577bd772e0e79dea823))
* **mongodb:** Include virtuals on document responses ([bc407a0](https://github.com/TriPSs/nestjs-query/commit/bc407a0f7100a741d8a4084227e3767fcf36dd4a))
* **mongodb:** Use new filter on typegoose query service ([de34e92](https://github.com/TriPSs/nestjs-query/commit/de34e9240055b0f1cfbb360b66c37f216f115ddb))
* **mongodb:** Use typegoose for MongoDB support ([702dc83](https://github.com/TriPSs/nestjs-query/commit/702dc839638afd6b781dbb0f75f725d7286eb580))
* **mongoose:** Switch to native mongoose support ([5cdfa39](https://github.com/TriPSs/nestjs-query/commit/5cdfa39b7d91cf0f8438ef3387a89aac850f4452))
* **query-typegoose:** Adds the ability to use discriminators ([#1321](https://github.com/TriPSs/nestjs-query/issues/1321)) ([2a7da59](https://github.com/TriPSs/nestjs-query/commit/2a7da59c3c857acedbd786d6df5772645c00f543)), closes [#1320](https://github.com/TriPSs/nestjs-query/issues/1320)
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))
* **typegoose:** Implement `setRelations` to set many references ([4ec5fe0](https://github.com/TriPSs/nestjs-query/commit/4ec5fe07689eacb0456f531d69368b0451ce69a1))
* **typegoose:** Update to support new aggregate with groupBy ([90992e1](https://github.com/TriPSs/nestjs-query/commit/90992e1a1dcc4e4e888e5946ab639535932f8f52))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **mongoose,typegoose,#881:** Allow string objectId filters ([11098c4](https://github.com/TriPSs/nestjs-query/commit/11098c441de41462fe6c45742bc317f52ea09711)), closes [#881](https://github.com/TriPSs/nestjs-query/issues/881)
* **mongoose,typegoose:** fix type errors from bad renovate bot merge ([46d9a6f](https://github.com/TriPSs/nestjs-query/commit/46d9a6f49c011c5bc40d00b92d2fa17059f2702c))
* **query-typegoose:** ignore undefined id field in creation dto ([#1165](https://github.com/TriPSs/nestjs-query/issues/1165)) ([db5bf44](https://github.com/TriPSs/nestjs-query/commit/db5bf447bdf0095b01791b694785ecd3fb723c0f))
* **typegoose:** allow undefined id field when updating or creating ([c2031aa](https://github.com/TriPSs/nestjs-query/commit/c2031aaf8c65fe7f2440f5b434329662c02296e4))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **mongodb:** Add support for all filter operators ([9420036](https://github.com/TriPSs/nestjs-query/commit/9420036d8d24e825c08b60bd9773404e26968ea5))
* **mongodb:** Add support for list of references ([bc926a4](https://github.com/TriPSs/nestjs-query/commit/bc926a4f089fd790b8bc37ee126bfcc2f70fc145))
* **mongodb:** Allow to customize mongoose document options ([46db24a](https://github.com/TriPSs/nestjs-query/commit/46db24ac2b424b9379d380792328ee670fb281e3))
* **mongodb:** Allow to override filter operators ([24e7c0a](https://github.com/TriPSs/nestjs-query/commit/24e7c0a6146ca37598b73577bd772e0e79dea823))
* **mongodb:** Include virtuals on document responses ([bc407a0](https://github.com/TriPSs/nestjs-query/commit/bc407a0f7100a741d8a4084227e3767fcf36dd4a))
* **mongodb:** Use new filter on typegoose query service ([de34e92](https://github.com/TriPSs/nestjs-query/commit/de34e9240055b0f1cfbb360b66c37f216f115ddb))
* **mongodb:** Use typegoose for MongoDB support ([702dc83](https://github.com/TriPSs/nestjs-query/commit/702dc839638afd6b781dbb0f75f725d7286eb580))
* **mongoose:** Switch to native mongoose support ([5cdfa39](https://github.com/TriPSs/nestjs-query/commit/5cdfa39b7d91cf0f8438ef3387a89aac850f4452))
* **query-typegoose:** Adds the ability to use discriminators ([#1321](https://github.com/TriPSs/nestjs-query/issues/1321)) ([2a7da59](https://github.com/TriPSs/nestjs-query/commit/2a7da59c3c857acedbd786d6df5772645c00f543)), closes [#1320](https://github.com/TriPSs/nestjs-query/issues/1320)
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))
* **typegoose:** Implement `setRelations` to set many references ([4ec5fe0](https://github.com/TriPSs/nestjs-query/commit/4ec5fe07689eacb0456f531d69368b0451ce69a1))
* **typegoose:** Update to support new aggregate with groupBy ([90992e1](https://github.com/TriPSs/nestjs-query/commit/90992e1a1dcc4e4e888e5946ab639535932f8f52))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
