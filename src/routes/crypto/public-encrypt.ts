import express, { Response, Request } from 'express';
import { BadRequestError } from '../../errors';
import crypto from 'crypto';
import { AuthenticatedMiddleware as requireAuth } from '../../middlewares/require-auth';
import { User } from '../../models/User';

const router = express.Router();

router.post('/', requireAuth, async (req: Request, res: Response) => {
	const { payload: data } = req.body;

	if (!data) {
		const error = new BadRequestError(
			'Must provide valid plain text data to be encrypted'
		);
		return res.send(error.serializeErrors()).status(error.statusCode);
	}

	const user = await User.findOne({ phone: req.currentUser?.phone });

	const cipherText = crypto.publicEncrypt(
		{
			key: user?.publicKey!,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: 'sha512',
		},
		// We convert the data string to a buffer using `Buffer.from`
		Buffer.from(data)
	);

	// The encrypted data is in the form of bytes, so we print it in base64 format
	// so that it's displayed in a more readable form
	// console.log("encypted data: ", cipherText.toString("hex"))
	res.status(200).send(cipherText.toString('hex'));
});

export { router as encryptionRouter };

// "publicKey": "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAsdue/1BtL1pgtbjylc0x\nNF0hrdV4hNY90oDmmAF7ead1f1lpSeeIpxq+7xEBqT5nWqRGPFXa8uAFD1EwuIkN\niXrlx/Atiaa78J0NpchSTxuL+05+h6jFe01f3Z41tH94oWjWtt1N+r244k2TliGO\nahAdn0pN8OXMMwzPDmRzm0B8+WUXJS5CZrvKAXtt6soF/o0CL1KZu9zr92h8G66/\nbTFXlK8a9onCsumMh8aBILp1k77nHVT9AXPXPgLstT8u2qzQ2mjGKFSKStixyC/x\nrGVhewSupavca4GAbXJyB/Sq6MN2hXqjWuOPpIQ/ExHNlHjGLQ6JAbO1qSkoQiUe\nZ40Tl34NkAUV+pSV7Oz0xAQMWXC6bm427bX15T2djqRoI+iJv53j9Vr8yfew+Erq\nag+9zHW/7ktiegRCK2qqVo635t8v+9cJl3Ah2uXh099SpFAqsJxGWVuZYRq+LoQV\nJubeByLS6Sc9TNcJtq2/Ssqa/BWEqvTJ+Ucp/JW5+uWulzIb74nqjEXjIkgMjDx+\n9bsWXkUG6jwKf8jXDCu4qvZCx0nPhKWPVGjaaY87Ou5mmXOs8jHFS47x41M2Cnm/\nV+tJJu7MgSvQ67civo/WTwPYg7KQjleXER1wsoyWj5ILtUL3lCsh4Es8Ndn6rqWA\nGee52h9ITFg79nQZRtn9u/ECAwEAAQ==\n-----END PUBLIC KEY-----\n",
// "privateKey": "-----BEGIN ENCRYPTED PRIVATE KEY-----\n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\n-----END ENCRYPTED PRIVATE KEY-----\n",
