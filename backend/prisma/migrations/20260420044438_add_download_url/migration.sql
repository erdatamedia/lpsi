-- CreateTable
CREATE TABLE `document` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(100) NOT NULL,
    `id_user` INTEGER NOT NULL,
    `durasi` INTEGER NOT NULL,
    `status` VARCHAR(30) NOT NULL,
    `downloadUrl` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL,
    `institutionId` INTEGER NULL,

    INDEX `fk_document_institution`(`institutionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_document` INTEGER NOT NULL,
    `waktu` DATETIME(0) NOT NULL,
    `status` VARCHAR(100) NOT NULL,
    `note` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `institutionId` INTEGER NULL,

    INDEX `fk_users_institution`(`institutionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `institution` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `trackingTitle` VARCHAR(200) NOT NULL,
    `logoUrl` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `slug`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `document` ADD CONSTRAINT `fk_document_institution` FOREIGN KEY (`institutionId`) REFERENCES `institution`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `document` ADD CONSTRAINT `document_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historis` ADD CONSTRAINT `historis_id_document_fkey` FOREIGN KEY (`id_document`) REFERENCES `document`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_institution` FOREIGN KEY (`institutionId`) REFERENCES `institution`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
