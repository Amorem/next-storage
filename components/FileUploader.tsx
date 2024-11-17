"use client";

import { useDropzone } from "react-dropzone";
import React, { useCallback, useState } from "react";
import { Button } from "./ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "./Thumbnail";

interface FileUploaderProps {
	ownerId: string;
	accountId: string;
	className?: string;
}

export default function FileUploader({
	ownerId,
	accountId,
	className,
}: FileUploaderProps) {
	const [files, setFiles] = useState<File[]>([]);
	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		setFiles(acceptedFiles);
	}, []);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

	function handleRemoveFile(
		event: React.MouseEvent<HTMLImageElement, MouseEvent>,
		fileName: string
	) {
		event.stopPropagation();
		setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
	}

	return (
		<div className="cursor-pointer" {...getRootProps()}>
			<input {...getInputProps()} />
			<Button type="button" className={cn("uploader-button")}>
				<Image
					src="/assets/icons/upload.svg"
					alt="upload"
					width={24}
					height={24}
				/>
				<p>Upload</p>
			</Button>
			{files.length > 0 && (
				<ul className="uploader-preview-list">
					<h4 className="h4 text-light-100"></h4>
					{files.map((file, index) => {
						const { type, extension } = getFileType(file.name);
						return (
							<li
								key={`${file.name}-${index}`}
								className="uploader-preview-item"
							>
								<div className="flex items-center gap-3">
									<Thumbnail
										type={type}
										extension={extension}
										url={convertFileToUrl(file)}
									/>
									<div className="preview-item-name">
										{file.name}
										<Image
											src="/assets/icons/file-loader.gif"
											height={26}
											width={80}
											alt="loader"
										/>
									</div>
								</div>
								<Image
									src="/assets/icons/remove.svg"
									height={24}
									width={24}
									alt="remove"
									onClick={(event) => handleRemoveFile(event, file.name)}
								/>
							</li>
						);
					})}
				</ul>
			)}
			{isDragActive ? (
				<p>Drop the files here ...</p>
			) : (
				<p>Drag and drop some files here, or click to select files</p>
			)}
		</div>
	);
}
